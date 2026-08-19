import { useMemo } from "react";
import { useSearchTrend, useTopDimension } from "./hooks";
import type { DimensionRow } from "./queries";

/**
 * Adapters that shape live Supabase rows into what the product boards already
 * render, so a board gains real data without being rewritten around it.
 *
 * The honest boundary matters here. Search Console gives clicks, impressions,
 * CTR and position — and nothing else. Qualified sessions, conversions and
 * revenue come from Meridian's own tracker, which this database does not hold.
 * So the adapters leave those fields `undefined` on live rows rather than
 * inventing them, and the tables render "—". A number that looks like revenue
 * but is really `clicks * 1.2` is worse than no number at all.
 */

export type Opportunity = "High" | "Medium" | "Low";

/**
 * Opportunity from real signals only: a page ranking on the edge of page one
 * with volume behind it and a CTR below what that position normally earns is a
 * genuine lever. Rankings above 3 are already converting their impressions;
 * anything past 20 needs ranking work before CTR work.
 */
export function scoreOpportunity(row: {
  impressions: number;
  position: number;
  ctr: number;
}): Opportunity {
  const { impressions, position, ctr } = row;
  if (impressions < 100) return "Low";

  // Rough expected CTR by position — the curve is steep at the top.
  const expected = position <= 3 ? 0.2 : position <= 10 ? 0.06 : position <= 20 ? 0.015 : 0.005;
  const underperforming = ctr < expected * 0.6;
  const strikingDistance = position > 3 && position <= 20;

  if (strikingDistance && underperforming && impressions >= 1000) return "High";
  if (strikingDistance && (underperforming || impressions >= 5000)) return "Medium";
  return "Low";
}

/** A query/page row as the boards consume it. Live rows omit the tracker-only fields. */
export interface LiveSearchRecord {
  id: string;
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  /** 0–1. */
  ctr: number;
  position: number;
  opportunity: Opportunity;
  /** True when this came from Supabase rather than the demo seed. */
  isLive: true;
  /** Not tracked in this database — rendered as "—". */
  qualifiedSessions?: undefined;
  conversions?: undefined;
  value?: undefined;
}

function toRecord(row: DimensionRow, kind: "query" | "page", i: number): LiveSearchRecord {
  return {
    id: `live-${kind}-${i}`,
    query: kind === "query" ? row.key : "",
    page: kind === "page" ? row.key : "",
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position,
    opportunity: scoreOpportunity(row),
    isLive: true,
  };
}

/**
 * Live top queries for a property, already scored. `undefined` while loading or
 * when there is no session — callers fall back to their seed data.
 */
export function useLiveQueries(projectId: string | undefined, days = 28, limit = 50) {
  const { data, isLoading, error } = useTopDimension(projectId, "query", days, limit);
  const records = useMemo(
    () => data?.map((row, i) => toRecord(row, "query", i)),
    [data],
  );
  return { records, isLoading, error };
}

/** Live top pages for a property, already scored. */
export function useLivePages(projectId: string | undefined, days = 28, limit = 50) {
  const { data, isLoading, error } = useTopDimension(projectId, "page", days, limit);
  const records = useMemo(() => data?.map((row, i) => toRecord(row, "page", i)), [data]);
  return { records, isLoading, error };
}

/** Formatted KPI strip for a pillar header, from the live Search Console trend. */
export function useSearchKpis(projectId: string | undefined, days = 28) {
  const { data, isLoading } = useSearchTrend(projectId, days);

  const kpis = useMemo(() => {
    if (!data) return undefined;
    const { totals, delta } = data;
    return [
      {
        label: "Search Clicks",
        value: totals.clicks.toLocaleString(),
        delta: formatRatio(delta.clicks),
        positive: delta.clicks >= 0,
      },
      {
        label: "Impressions",
        value: totals.impressions.toLocaleString(),
        delta: formatRatio(delta.impressions),
        positive: delta.impressions >= 0,
      },
      {
        label: "Avg CTR",
        value: `${(totals.ctr * 100).toFixed(2)}%`,
        delta: formatRatio(delta.ctr),
        positive: delta.ctr >= 0,
      },
      {
        // Position is a rank: a NEGATIVE change means the site moved up, so the
        // sign of the delta and the sign of "good" are opposites here.
        label: "Avg Position",
        value: totals.position.toFixed(1),
        delta: `${delta.position >= 0 ? "+" : ""}${delta.position.toFixed(1)}`,
        positive: delta.position <= 0,
      },
    ];
  }, [data]);

  return { kpis, trend: data, isLoading };
}

export function formatRatio(r: number): string {
  const pct = r * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
}
