import { ArrowUpRight, CheckCircle, ChevronRight, Sparkles, TrendingUp, X } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { cn } from "@/lib/utils";

export interface OpportunityItem {
  id: string;
  title: string;
  target: string;
  impact: "High" | "Medium" | "Low";
  category: "SEO" | "CRO" | "Revenue" | "Technical" | "Content";
  confidence: number;
  why: string;
  metrics: {
    position?: number | string;
    impressions?: string;
    ctr?: string;
    qualifiedRate?: string;
    estRevenue?: string;
  };
  upside: string;
}

export function OpportunityCardV2({
  opp,
  onEvidence,
  onCreateTask,
  onDismiss,
  className,
}: {
  opp: OpportunityItem;
  onEvidence?: () => void;
  onCreateTask?: () => void;
  onDismiss?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-4 transition-all duration-150 hover:border-border-strong hover:shadow-xs",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className={cn(
                "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                opp.impact === "High" && "bg-accent-soft text-accent",
                opp.impact === "Medium" && "bg-warning-soft text-warning",
                opp.impact === "Low" && "bg-subtle-surface text-muted",
              )}
            >
              {opp.impact} Impact
            </span>
            <span className="text-xs text-muted">· {opp.category}</span>
            <span className="text-xs text-subtle">· {opp.confidence}% confidence</span>
          </div>

          <h4 className="text-sm font-semibold text-fg tracking-tight truncate">{opp.title}</h4>
          <p className="font-mono text-xs text-accent truncate mt-0.5">{opp.target}</p>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss opportunity"
            className="rounded p-1 text-subtle hover:bg-subtle-surface hover:text-fg transition-colors"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <p className="mt-2.5 text-xs leading-relaxed text-muted font-normal">{opp.why}</p>

      {/* Metrics Row */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-lg bg-elevated/60 p-2.5 text-xs">
        {opp.metrics.position !== undefined && (
          <div>
            <span className="caption block">Avg Position</span>
            <span className="font-semibold text-fg">{opp.metrics.position}</span>
          </div>
        )}
        {opp.metrics.impressions && (
          <div>
            <span className="caption block">Impressions</span>
            <span className="font-semibold text-fg">{opp.metrics.impressions}</span>
          </div>
        )}
        {opp.metrics.ctr && (
          <div>
            <span className="caption block">CTR</span>
            <span className="font-semibold text-fg">{opp.metrics.ctr}</span>
          </div>
        )}
        {opp.metrics.qualifiedRate && (
          <div>
            <span className="caption block">Qualified Rate</span>
            <span className="font-semibold text-positive">{opp.metrics.qualifiedRate}</span>
          </div>
        )}
        {opp.metrics.estRevenue && (
          <div>
            <span className="caption block">Est Upside</span>
            <span className="font-semibold text-accent">{opp.metrics.estRevenue}</span>
          </div>
        )}
      </div>

      {/* Action footer */}
      <div className="mt-3.5 flex items-center justify-between gap-2 pt-2 border-t border-border/50">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <TrendingUp className="size-3.5 text-positive" />
          <span>Upside: <strong className="text-fg">{opp.upside}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          {onEvidence && (
            <button
              type="button"
              onClick={onEvidence}
              className="text-xs font-medium text-muted hover:text-fg transition-colors px-2 py-1"
            >
              View evidence
            </button>
          )}
          {onCreateTask && (
            <button
              type="button"
              onClick={onCreateTask}
              className="inline-flex items-center gap-1 rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-white shadow-xs hover:bg-accent/90 transition-colors"
            >
              <CheckCircle className="size-3" />
              <span>Create task</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
