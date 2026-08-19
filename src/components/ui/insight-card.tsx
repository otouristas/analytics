import { useMemo } from "react";
import { ArrowRight, ChevronRight, Sparkles, X } from "lucide-react";
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

/** A brief broken into its lead sentence and any labelled sections after it. */
interface ParsedBrief {
  lead: string;
  sections: { label: string; body: string }[];
}

/**
 * The generated brief arrives as one run of prose with inline labels:
 *
 *   "Live Stream: … Traffic Origins: … System Health: … Recommendation: …"
 *
 * Rendered verbatim that is a five-line wall nobody reads. Splitting on those
 * labels turns it into a lead plus a short definition list, which is the same
 * information at a tenth of the reading cost. Text with no labels is left
 * exactly as written.
 */
function parseBrief(content: string): ParsedBrief {
  // A label is 1–3 capitalised words followed by a colon.
  const pattern = /(^|\s)((?:[A-Z][A-Za-z-]*\s?){1,3}):\s/g;
  const marks: { index: number; label: string; end: number }[] = [];
  for (const m of content.matchAll(pattern)) {
    const label = m[2]?.trim();
    if (!label) continue;
    marks.push({
      index: (m.index ?? 0) + (m[1]?.length ?? 0),
      label,
      end: (m.index ?? 0) + m[0].length,
    });
  }

  if (marks.length === 0) return { lead: content.trim(), sections: [] };

  const lead = content.slice(0, marks[0]!.index).trim();
  const sections = marks.map((mark, i) => ({
    label: mark.label,
    body: content.slice(mark.end, marks[i + 1]?.index ?? content.length).trim(),
  }));

  // A single trailing label is not worth a list; keep it inline.
  if (sections.length < 2) return { lead: content.trim(), sections: [] };

  return { lead, sections };
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
  const { lead, sections } = useMemo(() => parseBrief(content), [content]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-hairline bg-surface p-4 sm:p-5",
        className,
      )}
    >
      {/* A single accent hairline down the left edge marks this as the machine's
          voice, without wrapping the card in a coloured panel. */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-accent via-brand to-transparent"
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <Sparkles className="size-3.5" />
          </span>
          <div>
            <span className="eyebrow block">{kicker}</span>
            <h4 className="mt-0.5 text-sm font-semibold tracking-tight text-fg">{title}</h4>
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss insight"
            className="rounded p-1 text-muted transition-colors hover:bg-subtle-surface hover:text-fg"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {lead && (
        <p className="mt-3.5 max-w-3xl text-pretty text-sm leading-relaxed text-fg">{lead}</p>
      )}

      {sections.length > 0 && (
        <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {sections.map((section) => (
            <div key={section.label} className="min-w-0">
              <dt className="kicker">{section.label}</dt>
              <dd className="mt-1 text-pretty text-[0.8125rem] leading-relaxed text-muted">
                {section.body}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {metrics && metrics.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-hairline pt-3.5">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="flex items-center gap-1.5 rounded-lg bg-subtle-surface px-2.5 py-1 text-xs"
            >
              <span className="text-muted">{m.label}</span>
              <span
                className={cn(
                  "font-medium tabular-nums",
                  m.positive === undefined
                    ? "text-fg"
                    : m.positive
                      ? "delta-positive"
                      : "delta-negative",
                )}
              >
                {m.value}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {onInvestigate && (
          <button
            type="button"
            onClick={onInvestigate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg transition-opacity hover:opacity-90"
          >
            <span>Investigate</span>
            <ArrowRight className="size-3" />
          </button>
        )}
        {onAskFollowup && (
          <button
            type="button"
            onClick={onAskFollowup}
            className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-surface-raised px-3 py-1.5 text-xs font-medium text-fg transition-colors hover:border-brand/40"
          >
            <span>Ask follow-up</span>
            <ChevronRight className="size-3 text-muted" />
          </button>
        )}
      </div>
    </div>
  );
}
