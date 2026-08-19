import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { supabaseEnabled } from "./client";
import { useSupabaseUserId } from "./auth";
import {
  fetchDailyTotals,
  fetchGscProperties,
  fetchLatestSyncRun,
  fetchOpportunities,
  fetchProjects,
  fetchTopDimension,
  lastNDays,
  previousPeriod,
  totalsFrom,
  type DailyPoint,
  type DateRange,
  type DimensionRow,
  type SearchTotals,
} from "./queries";
import type { SeoProject } from "./types";

/**
 * React Query bindings for the Supabase read layer.
 *
 * Every hook is keyed on the user id as well as its own arguments. RLS means
 * the same query returns different rows for different users, so omitting the id
 * would serve one account's cache to the next after a sign-in switch.
 *
 * All of them are gated on `enabled`: with no session, or no Supabase
 * configured, they stay idle rather than firing a request that RLS will answer
 * with an empty array. Callers can treat `data === undefined` as "no live data,
 * fall back to the demo figures".
 */

function useLiveGate(extra = true): { userId: string | null; enabled: boolean } {
  const userId = useSupabaseUserId();
  return { userId, enabled: supabaseEnabled && Boolean(userId) && extra };
}

/** Properties the signed-in user owns. */
export function useProjects(): UseQueryResult<SeoProject[]> {
  const { userId, enabled } = useLiveGate();
  return useQuery({
    queryKey: ["seo-projects", userId],
    queryFn: fetchProjects,
    enabled,
  });
}

/**
 * The user's default property: the one with Search Console attached, else the
 * first. Returns `undefined` until projects resolve.
 */
export function useDefaultProject(): SeoProject | undefined {
  const { data } = useProjects();
  if (!data || data.length === 0) return undefined;
  return data.find((p) => p.gsc_property_url) ?? data[0];
}

export interface SearchTrend {
  points: DailyPoint[];
  totals: SearchTotals;
  previousTotals: SearchTotals;
  /** Signed change vs the previous period, as a ratio (0.18 = +18%). */
  delta: {
    clicks: number;
    impressions: number;
    ctr: number;
    /** Change in absolute rank. Negative means the position IMPROVED. */
    position: number;
  };
}

function ratio(current: number, prior: number): number {
  if (prior === 0) return current === 0 ? 0 : 1;
  return (current - prior) / prior;
}

/**
 * The headline Search Console trend plus its period-over-period comparison.
 *
 * Fetches both windows in one query so the KPI strip and the chart never
 * disagree about which comparison period they are showing.
 */
export function useSearchTrend(
  projectId: string | undefined,
  days = 28,
): UseQueryResult<SearchTrend> {
  const { userId, enabled } = useLiveGate(Boolean(projectId));

  return useQuery({
    queryKey: ["gsc-trend", userId, projectId, days],
    enabled,
    queryFn: async (): Promise<SearchTrend> => {
      const range: DateRange = lastNDays(days);
      const prior = previousPeriod(range);
      const [points, priorPoints] = await Promise.all([
        fetchDailyTotals(projectId!, range),
        fetchDailyTotals(projectId!, prior),
      ]);
      const totals = totalsFrom(points);
      const previousTotals = totalsFrom(priorPoints);
      return {
        points,
        totals,
        previousTotals,
        delta: {
          clicks: ratio(totals.clicks, previousTotals.clicks),
          impressions: ratio(totals.impressions, previousTotals.impressions),
          ctr: ratio(totals.ctr, previousTotals.ctr),
          position: totals.position - previousTotals.position,
        },
      };
    },
  });
}

/** Top queries / pages / countries / devices for the active window. */
export function useTopDimension(
  projectId: string | undefined,
  dimension: "query" | "page" | "country" | "device",
  days = 28,
  limit = 50,
): UseQueryResult<DimensionRow[]> {
  const { userId, enabled } = useLiveGate(Boolean(projectId));
  return useQuery({
    queryKey: ["gsc-dimension", userId, projectId, dimension, days, limit],
    enabled,
    queryFn: () => fetchTopDimension(projectId!, dimension, lastNDays(days), limit),
  });
}

/** Prioritised opportunities for a property. */
export function useOpportunities(projectId: string | undefined, limit = 50) {
  const { userId, enabled } = useLiveGate(Boolean(projectId));
  return useQuery({
    queryKey: ["si-opportunities", userId, projectId, limit],
    enabled,
    queryFn: () => fetchOpportunities(projectId!, limit),
  });
}

/** Latest Search Console ingest run — "Last sync 2 min ago" and sync health. */
export function useLatestSyncRun(projectId: string | undefined) {
  const { userId, enabled } = useLiveGate(Boolean(projectId));
  return useQuery({
    queryKey: ["gsc-sync-run", userId, projectId],
    enabled,
    queryFn: () => fetchLatestSyncRun(projectId!),
    // Sync state is the one thing here that genuinely moves minute to minute.
    staleTime: 60_000,
  });
}

/** Connected Search Console properties, for integrations and the import flow. */
export function useGscProperties() {
  const { userId, enabled } = useLiveGate();
  return useQuery({
    queryKey: ["gsc-properties", userId],
    enabled,
    queryFn: fetchGscProperties,
  });
}
