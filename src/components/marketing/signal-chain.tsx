import { Section, SectionHeading, Bloom } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

/**
 * The signal chain: seven stages from raw search impression to a decision.
 *
 * Drawn rather than illustrated — a numbered rail with a hairline connector,
 * so it reads as a system diagram in the product's own visual language instead
 * of a stock graphic. The connector is a real element (not a border trick) so
 * it can carry the brand gradient and stop cleanly at the last node.
 */

interface Stage {
  name: string;
  detail: string;
}

const STAGES: Stage[] = [
  { name: "Search Console", detail: "Impressions, clicks, position, by query and page" },
  { name: "Traffic", detail: "Sessions resolved to source, campaign and channel" },
  { name: "Behavior", detail: "What each visitor actually did on the page" },
  { name: "Intent", detail: "Which sessions showed commercial signal" },
  { name: "Conversions", detail: "Bookings, leads and partner outbound clicks" },
  { name: "Revenue", detail: "Confirmed value, separated from estimated" },
  { name: "Intelligence", detail: "What changed, why, and what to do next" },
];

export function SignalChain() {
  return (
    // `overflow-hidden` is load-bearing, not cosmetic: the bloom below is
    // 34rem wide and offset off the right edge, so without clipping it widens
    // the scroll area and the whole page scrolls sideways on phones.
    <Section id="how" className="relative overflow-hidden">
      <Bloom soft className="right-[-8rem] top-1/4 h-[26rem] w-[34rem]" />

      {/* Split editorial layout: the argument stays pinned on the left while
          the chain scrolls past it. A single narrow column left the right half
          of a 1440px screen completely empty. */}
      <div className="relative grid gap-12 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading
            align="left"
            eyebrow="How it fits together"
            title={
              <>
                One analytics layer.
                <br />
                <span className="text-muted">Every important signal.</span>
              </>
            }
            body="Most stacks can tell you a page got clicks and, separately, that revenue moved. Meridian keeps the link between them intact from the impression all the way to the euro."
          />
        </div>

        <ol className="relative">
          {/* The rail. Sits behind the nodes, inset by half a node so it starts
              and ends at their centres rather than overshooting. */}
          <span
            aria-hidden="true"
            className="absolute bottom-8 left-[0.9375rem] top-8 w-px bg-gradient-to-b from-accent/50 via-brand/40 to-transparent sm:left-[1.1875rem]"
          />

          {STAGES.map((stage, i) => {
            const isLast = i === STAGES.length - 1;
            return (
              <li key={stage.name} className="relative flex gap-4 pb-7 last:pb-0 sm:gap-5">
                <span
                  className={cn(
                    "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full",
                    "border bg-surface font-mono text-[11px] tabular-nums",
                    isLast
                      ? "border-brand/40 text-brand"
                      : "border-hairline text-muted",
                    "sm:size-10 sm:text-xs",
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* The rule is driven by the index, not `last:`. Each div is the
                    only child of its own <li>, so `last:border-0` matched every
                    row and no divider ever rendered. */}
                <div
                  className={cn(
                    "min-w-0 flex-1 pb-7 pt-1 sm:pt-2",
                    !isLast && "border-b border-hairline",
                  )}
                >
                  <h3 className="text-sm font-medium text-fg sm:text-base">{stage.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{stage.detail}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}
