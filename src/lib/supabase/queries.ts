import { requireSupabase } from "./client";
import type {
  GscDimensionSet,
  GscProperty,
  GscSearchAnalyticsRow,
  GscSyncRun,
  SeoProject,
  SearchIntelligenceOpportunity,
} from "./types";

/**
 * Read layer over the AnotherSEOGuru Supabase schema.
 *
 * Two rules the rest of the app depends on:
 *
 * 1. NEVER mix `dimension_set` values in one aggregate. `daily_total`,
 *    `date_query_page` and `date_query_page_country_device` describe the SAME
 *    clicks at different breakdowns, so summing across them multiplies the
 *    totals. Every function here pins exactly one set.
 * 2. `position` is a rank: LOWER is better. Deltas on it invert, which is why
 *    `positive` is computed rather than taken from the sign of the change.
 *
 * PostgREST caps a response at 1000 rows by default, so anything that
 * aggregates a date range pages explicitly rather than silently truncating.
 */

/** PostgREST's per-request row ceiling. */
const PAGE_SIZE = 1000;

export interface DateRange {
  /** Inclusive, `YYYY-MM-DD`. */
  from: string;
  /** Inclusive, `YYYY-MM-DD`. */
  to: string;
}

/** `n` days ending today, as the inclusive range the GSC tables are keyed by. */
export function lastNDays(n: number): DateRange {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - (n - 1));
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { from: iso(from), to: iso(to) };
}

/** The period of equal length immediately before `range`, for comparisons. */
export function previousPeriod(range: DateRange): DateRange {
  const from = new Date(range.from);
  const to = new Date(range.to);
  const days = Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1;
  const prevTo = new Date(from);
  prevTo.setDate(prevTo.getDate() - 1);
  const prevFrom = new Date(prevTo);
  prevFrom.setDate(prevFrom.getDate() - (days - 1));
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { from: iso(prevFrom), to: iso(prevTo) };
}

/** Every property the signed-in user owns. Empty when signed out (RLS). */
export async function fetchProjects(): Promise<SeoProject[]> {
  const { data, error } = await requireSupabase()
    .from("seo_projects")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Failed to load properties: ${error.message}`);
  return data ?? [];
}

/**
 * Pull every row of one dimension set across a date range, following
 * PostgREST's 1000-row pages to the end. `date_query_page` runs to ~165k rows
 * for a busy property, so callers should keep ranges tight or use
 * `daily_total`.
 */
async function fetchAllRows(
  projectId: string,
  dimensionSet: GscDimensionSet,
  range: DateRange,
  columns: string,
): Promise<GscSearchAnalyticsRow[]> {
  const supabase = requireSupabase();
  const out: GscSearchAnalyticsRow[] = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("gsc_search_analytics")
      .select(columns)
      .eq("seo_project_id", projectId)
      .eq("dimension_set", dimensionSet)
      .gte("date", range.from)
      .lte("date", range.to)
      .order("date", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw new Error(`Failed to load Search Console data: ${error.message}`);
    const rows = (data ?? []) as unknown as GscSearchAnalyticsRow[];
    out.push(...rows);
    if (rows.length < PAGE_SIZE) return out;
  }
}

export interface DailyPoint {
  date: string;
  clicks: number;
  impressions: number;
  /** 0–1, recomputed from totals — averaging Google's per-row ctr is wrong. */
  ctr: number;
  /** Impression-weighted average position. */
  position: number;
}

/**
 * The daily trend line. Reads `daily_total`, which Google pre-aggregates, so
 * this is ~1 row per day rather than thousands.
 */
export async function fetchDailyTotals(
  projectId: string,
  range: DateRange,
): Promise<DailyPoint[]> {
  const rows = await fetchAllRows(projectId, "daily_total", range, "date,clicks,impressions,ctr,position");

  // One row per date is the norm, but a re-sync can leave duplicates; fold them
  // so the chart never shows two points on the same day.
  const byDate = new Map<string, { clicks: number; impressions: number; posWeighted: number }>();
  for (const row of rows) {
    const acc = byDate.get(row.date) ?? { clicks: 0, impressions: 0, posWeighted: 0 };
    acc.clicks += row.clicks ?? 0;
    acc.impressions += row.impressions ?? 0;
    acc.posWeighted += (row.position ?? 0) * (row.impressions ?? 0);
    byDate.set(row.date, acc);
  }

  return [...byDate.entries()]
    .map(([date, a]) => ({
      date,
      clicks: a.clicks,
      impressions: a.impressions,
      ctr: a.impressions > 0 ? a.clicks / a.impressions : 0,
      position: a.impressions > 0 ? a.posWeighted / a.impressions : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export interface SearchTotals {
  clicks: number;
  impressions: number;
  /** 0–1. */
  ctr: number;
  /** Impression-weighted; lower is better. */
  position: number;
  days: number;
}

export function totalsFrom(points: DailyPoint[]): SearchTotals {
  const clicks = points.reduce((n, p) => n + p.clicks, 0);
  const impressions = points.reduce((n, p) => n + p.impressions, 0);
  const posWeighted = points.reduce((n, p) => n + p.position * p.impressions, 0);
  return {
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : 0,
    position: impressions > 0 ? posWeighted / impressions : 0,
    days: points.length,
  };
}

export interface DimensionRow {
  key: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

/**
 * Top queries / pages / countries / devices for a range.
 *
 * Aggregation happens client-side because PostgREST has no GROUP BY: the rows
 * arrive at `date_query_page` grain and are folded here. That is fine for the
 * 28–90 day windows the UI offers; a multi-year window belongs in an RPC.
 */
export async function fetchTopDimension(
  projectId: string,
  dimension: "query" | "page" | "country" | "device",
  range: DateRange,
  limit = 50,
): Promise<DimensionRow[]> {
  // country and device only exist on the wider breakdown.
  const set: GscDimensionSet =
    dimension === "country" || dimension === "device"
      ? "date_query_page_country_device"
      : "date_query_page";

  const rows = await fetchAllRows(
    projectId,
    set,
    range,
    `${dimension},clicks,impressions,position`,
  );

  const acc = new Map<string, { clicks: number; impressions: number; posWeighted: number }>();
  for (const row of rows) {
    const key = (row as unknown as Record<string, string | null>)[dimension];
    if (!key) continue;
    const cur = acc.get(key) ?? { clicks: 0, impressions: 0, posWeighted: 0 };
    cur.clicks += row.clicks ?? 0;
    cur.impressions += row.impressions ?? 0;
    cur.posWeighted += (row.position ?? 0) * (row.impressions ?? 0);
    acc.set(key, cur);
  }

  return [...acc.entries()]
    .map(([key, a]) => ({
      key,
      clicks: a.clicks,
      impressions: a.impressions,
      ctr: a.impressions > 0 ? a.clicks / a.impressions : 0,
      position: a.impressions > 0 ? a.posWeighted / a.impressions : 0,
    }))
    .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions)
    .slice(0, limit);
}

/** Prioritised actions from the search-intelligence worker. */
export async function fetchOpportunities(
  projectId: string,
  limit = 50,
): Promise<SearchIntelligenceOpportunity[]> {
  const { data, error } = await requireSupabase()
    .from("search_intelligence_opportunities")
    .select("*")
    .eq("project_id", projectId)
    .order("score", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw new Error(`Failed to load opportunities: ${error.message}`);
  return data ?? [];
}

/** The most recent ingest run — drives "Last sync" and sync-health states. */
export async function fetchLatestSyncRun(projectId: string): Promise<GscSyncRun | null> {
  const { data, error } = await requireSupabase()
    .from("gsc_sync_runs")
    .select("*")
    .eq("seo_project_id", projectId)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Failed to load sync status: ${error.message}`);
  return data ?? null;
}

/** Connected Search Console properties, for the integrations and import flows. */
export async function fetchGscProperties(): Promise<GscProperty[]> {
  const { data, error } = await requireSupabase()
    .from("gsc_properties")
    .select("*")
    .order("site_url", { ascending: true });
  if (error) throw new Error(`Failed to load Search Console properties: ${error.message}`);
  return data ?? [];
}
