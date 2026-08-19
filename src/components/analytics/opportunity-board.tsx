import { useMemo } from "react";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { opportunities } from "@/lib/analytics/insights";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { PillarHeader } from "@/components/ui/pillar-header";
import { EmptyState } from "@/components/ui/empty-state";
import { useDefaultProject, useOpportunities } from "@/lib/supabase/hooks";
import type { SearchIntelligenceOpportunity } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

/**
 * Opportunities from two independent engines, kept visually separate because
 * they answer different questions and neither can be derived from the other:
 *
 * - Search Console (Supabase `search_intelligence_opportunities`): where demand
 *   exists that the site is not yet capturing.
 * - Meridian's own tracker: where traffic already arrives but fails to convert.
 */
export function OpportunityBoard() {
  const { people, project } = useRealtime();
  const behaviourRows = useMemo(() => opportunities(people), [people]);

  const liveProject = useDefaultProject();
  const { data: searchRows, isLoading } = useOpportunities(liveProject?.id, 25);

  const p0 = searchRows?.filter((r) => r.priority === "P0").length ?? 0;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto pb-16">
      <PillarHeader
        eyebrow="Prioritised actions"
        title="Opportunities"
        ident={liveProject?.domain ?? project.host}
        dek="Ranked by business impact. Search opportunities come from Search Console; conversion opportunities come from your own visitor stream."
        meta={
          searchRows?.length
            ? `${searchRows.length} search opportunities · ${p0} act now`
            : undefined
        }
      />

      <section className="px-5 py-6">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="heading-md">Search demand</h3>
          <span className="kicker">Google Search Console</span>
        </div>

        {isLoading && (
          <div className="mt-4 space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-20 w-full" />
            ))}
          </div>
        )}

        {!isLoading && !searchRows?.length && (
          <EmptyState
            className="mt-4"
            title="No Search Console opportunities yet"
            description="Connect a Search Console property and run a sync to surface demand you are not capturing."
          />
        )}

        {!!searchRows?.length && (
          <ul className="mesh-grid mt-4">
            {searchRows.map((row) => (
              <li key={row.id} className="bg-surface">
                <OpportunityRow row={row} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border-t border-hairline px-5 py-6">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="heading-md">High traffic, weak conversion</h3>
          <span className="kicker">Meridian tracker</span>
        </div>
        <p className="mt-1 max-w-xl text-sm text-muted">
          Only pages with enough sessions in this stream. Impact is session volume, not invented euros.
        </p>

        {behaviourRows.length === 0 ? (
          <p className="py-8 text-sm text-subtle">
            Need more sessions on a page before we flag it.
          </p>
        ) : (
          <ul className="mt-4">
            {behaviourRows.map((row) => (
              <li key={row.path} className="border-b border-hairline py-4">
                <p className="kicker">{row.kind.replace(/-/g, " ")}</p>
                <p className="mt-1 text-fg">{row.title}</p>
                <p className="font-mono text-xs text-muted">{row.path}</p>
                <p className="mt-2 font-mono text-xs tabular-nums text-subtle">
                  {row.sessions} sessions · {row.conversions} conversions ·{" "}
                  {Math.round(row.rate * 1000) / 10}%
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

interface Evidence {
  period_days?: number;
  impression_growth_pct?: number;
  current?: { clicks?: number; impressions?: number; position?: number };
  current_period?: { clicks?: number; impressions?: number; position?: number };
}

function OpportunityRow({ row }: { row: SearchIntelligenceOpportunity }) {
  const evidence = (row.evidence ?? {}) as Evidence;
  const current = evidence.current_period ?? evidence.current;
  const growth = evidence.impression_growth_pct;

  return (
    <article className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <PriorityPill priority={row.priority} />
            <span className="kicker">{row.opportunity_type.replace(/^gsc_/, "").replace(/_/g, " ")}</span>
          </div>
          <h4 className="mt-2 truncate text-sm font-medium text-fg">{row.title}</h4>
          {row.target_url && (
            <a
              href={row.target_url}
              target="_blank"
              rel="noreferrer"
              className="mt-0.5 inline-flex max-w-full items-center gap-1 truncate font-mono text-[11px] text-accent hover:underline"
            >
              <span className="truncate">{stripOrigin(row.target_url)}</span>
              <ExternalLink className="size-3 shrink-0" />
            </a>
          )}
        </div>

        {row.score !== null && (
          <div className="shrink-0 text-right">
            <span className="kicker block">Score</span>
            <span className="stat-value text-lg">{Math.round(Number(row.score))}</span>
          </div>
        )}
      </div>

      {current && (
        <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] tabular-nums text-muted">
          <Stat label="impressions" value={current.impressions?.toLocaleString()} />
          <Stat label="clicks" value={current.clicks?.toLocaleString()} />
          <Stat label="position" value={current.position?.toFixed(1)} />
          {growth !== undefined && (
            <span className="inline-flex items-center gap-1 text-positive">
              <ArrowUpRight className="size-3" />
              {growth.toFixed(0)}% impressions
            </span>
          )}
        </dl>
      )}

      {row.recommendation && (
        <p className="mt-3 border-l-2 border-brand pl-3 text-xs leading-relaxed text-muted">
          {row.recommendation}
        </p>
      )}
    </article>
  );
}

function Stat({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <span>
      <span className="text-subtle">{label} </span>
      {value}
    </span>
  );
}

/** P0 is act-now; P3 is backlog. Colour AND label, never colour alone. */
function PriorityPill({ priority }: { priority: string | null }) {
  if (!priority) return null;
  return (
    <span
      className={cn(
        "status-badge",
        priority === "P0"
          ? "status-badge--critical"
          : priority === "P1"
            ? "status-badge--watch"
            : "status-badge--neutral",
      )}
    >
      {priority}
    </span>
  );
}

function stripOrigin(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}
