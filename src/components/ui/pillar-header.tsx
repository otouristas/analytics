import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Bloom } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export interface PillarCrumb {
  label: string;
  href?: string;
}

export interface PillarKpi {
  label: string;
  value: string;
  delta?: string;
  /** Omit for metrics where up/down carries no judgement (position, share). */
  positive?: boolean;
}

export interface PillarHeaderProps {
  /** Small green all-caps line above the title. */
  eyebrow?: string;
  title: ReactNode;
  /** Monospace identifier rendered beside the title — a domain, a path, an id. */
  ident?: ReactNode;
  dek?: ReactNode;
  crumbs?: PillarCrumb[];
  badges?: ReactNode;
  actions?: ReactNode;
  /** Uppercase metadata line under the dek ("66 days of data", "3 properties"). */
  meta?: ReactNode;
  kpis?: PillarKpi[];
  /**
   * `marketing` is the editorial opener: oversized display type, deep padding,
   * blueprint ground with a bloom overhead. `product` is the in-app pillar
   * header: same identity, compressed to workspace density.
   */
  variant?: "product" | "marketing";
  /**
   * Hue for this surface's bloom, 150–290 (green -> teal -> blue -> indigo).
   * Shifts the glow only; lightness and chroma stay on brand in both themes.
   */
  signatureHue?: number;
  /** Blueprint grid ground. On by default. */
  grid?: boolean;
  className?: string;
  children?: ReactNode;
}

/**
 * The pillar header — the page-opener ported from the AnotherSEOGuru marketing
 * template and given a second, denser life inside the product.
 *
 * Structure, top to bottom: breadcrumbs, green eyebrow, oversized display
 * title with an optional monospace identifier, dek, uppercase meta line, then
 * a hairline-separated KPI strip. It sits on the 64px blueprint grid with a
 * bloom overhead — the two background patterns that carry the brand.
 *
 * The KPI strip is deliberately hairline columns rather than a row of cards:
 * a pillar header is one object, and four bordered boxes read as four.
 */
export function PillarHeader({
  eyebrow,
  title,
  ident,
  dek,
  crumbs,
  badges,
  actions,
  meta,
  kpis,
  variant = "product",
  signatureHue,
  grid = true,
  className,
  children,
}: PillarHeaderProps) {
  const isMarketing = variant === "marketing";

  return (
    <header
      className={cn(
        "pillar-shell",
        grid && "blueprint-grid",
        !isMarketing && "border-b border-hairline",
        className,
      )}
      style={signatureHue ? ({ "--signature-h": signatureHue } as React.CSSProperties) : undefined}
    >
      {/* Brand glow. Wider and higher on marketing, where it is the hero light;
          tucked into the top-right in product, where it must not compete with
          the data below. */}
      <Bloom
        signature={signatureHue !== undefined}
        className={
          isMarketing
            ? "left-1/2 top-[-8rem] h-[26rem] w-[56rem] -translate-x-1/2"
            : "right-[-6rem] top-[-10rem] h-[20rem] w-[34rem] opacity-60"
        }
      />

      <div
        className={cn(
          "relative",
          isMarketing
            ? "mx-auto max-w-6xl px-6 pb-12 pt-6"
            : "px-4 pb-5 pt-5 sm:px-6",
        )}
      >
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-muted">
              {crumbs.map((crumb, i) => (
                <li key={`${crumb.label}-${i}`} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="size-3 text-subtle" aria-hidden="true" />}
                  {crumb.href ? (
                    <a
                      href={crumb.href}
                      className="rounded-xs transition-colors hover:text-fg"
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span className={i === crumbs.length - 1 ? "text-fg" : undefined}>
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
          <div className="min-w-0 flex-1">
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}

            <div
              className={cn(
                "flex flex-wrap items-baseline gap-x-3 gap-y-1",
                eyebrow && (isMarketing ? "mt-4" : "mt-2"),
              )}
            >
              <h1
                className={cn(
                  "pillar-title min-w-0",
                  isMarketing && "pillar-title--marketing rise-in max-w-3xl",
                )}
              >
                {title}
              </h1>
              {ident && (
                <span className="font-mono text-xs text-accent">{ident}</span>
              )}
            </div>

            {dek && <p className="pillar-dek">{dek}</p>}

            {badges && <div className="mt-3 flex flex-wrap items-center gap-2">{badges}</div>}

            {meta && <p className={cn("pillar-meta", badges ? "mt-4" : "mt-5")}>{meta}</p>}
          </div>

          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>

        {children}
      </div>

      {kpis && kpis.length > 0 && (
        <div className={cn("pillar-kpis relative", isMarketing && "mt-4")}>
          {kpis.map((kpi) => (
            <div key={kpi.label} className="pillar-kpi">
              <span className="kicker block">{kpi.label}</span>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="stat-value text-xl">{kpi.value}</span>
                {kpi.delta && (
                  <span
                    className={cn(
                      "text-xs font-medium tabular-nums",
                      kpi.positive === undefined
                        ? "delta-neutral"
                        : kpi.positive
                          ? "delta-positive"
                          : "delta-negative",
                    )}
                  >
                    {kpi.delta}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
