import { ArrowRight, Sparkles, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InsightCardProps {
  title?: string;
  kicker?: string;
  content: string;
  metrics?: { label: string; value: string; positive?: boolean }[];
  onInvestigate?: () => void;
  onAskFollowup?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function InsightCard({
  title = "What deserves your attention",
  kicker = "AI Intelligence",
  content,
  metrics,
  onInvestigate,
  onAskFollowup,
  onDismiss,
  className,
}: InsightCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl border border-border bg-gradient-to-br from-surface via-surface to-elevated p-4 sm:p-5 shadow-xs transition-all",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-md bg-accent-soft text-accent">
            <Sparkles className="size-3.5" />
          </div>
          <div>
            <span className="kicker text-[10px] block text-accent font-semibold tracking-wider">{kicker}</span>
            <h4 className="text-sm font-semibold text-fg tracking-tight">{title}</h4>
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss insight"
            className="rounded p-1 text-muted hover:bg-subtle-surface hover:text-fg transition-colors"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted font-normal text-pretty">{content}</p>

      {metrics && metrics.length > 0 && (
        <div className="mt-3.5 flex flex-wrap gap-2 pt-2 border-t border-border/60">
          {metrics.map((m, idx) => (
            <div key={idx} className="flex items-center gap-1.5 rounded-lg bg-subtle-surface px-2.5 py-1 text-xs">
              <span className="text-muted">{m.label}:</span>
              <span className={cn("font-medium", m.positive ? "text-positive" : "text-fg")}>{m.value}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {onInvestigate && (
          <button
            type="button"
            onClick={onInvestigate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-accent/90 transition-colors"
          >
            <span>Investigate</span>
            <ArrowRight className="size-3" />
          </button>
        )}
        {onAskFollowup && (
          <button
            type="button"
            onClick={onAskFollowup}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-fg hover:bg-elevated transition-colors"
          >
            <span>Ask follow-up</span>
            <ChevronRight className="size-3 text-muted" />
          </button>
        )}
      </div>
    </div>
  );
}
