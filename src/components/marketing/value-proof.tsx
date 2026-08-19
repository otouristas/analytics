import { Section, SectionHeading, MeshGrid } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

/**
 * "Stop optimizing for traffic alone" — argued with two real-looking pages
 * rather than asserted in a headline.
 *
 * Page A wins every vanity metric and loses on every one that pays. The bars
 * are sized against each metric's own max, so the reversal between traffic and
 * revenue is visible before any of the numbers are read.
 */

interface PageStat {
  label: string;
  a: number;
  b: number;
  format: (n: number) => string;
  /**
   * A metric that is bigger but not better. Sessions is never highlighted as a
   * win — colouring it green would have the graphic arguing the exact opposite
   * of the section's point.
   */
  vanity?: boolean;
}

const STATS: PageStat[] = [
  { label: "Sessions", a: 100_000, b: 42_000, format: (n) => `${(n / 1000).toFixed(0)}K`, vanity: true },
  { label: "Qualified rate", a: 0.041, b: 0.318, format: (n) => `${(n * 100).toFixed(1)}%` },
  { label: "Conversions", a: 62, b: 481, format: (n) => n.toLocaleString() },
  { label: "Revenue", a: 2_400, b: 18_600, format: (n) => `€${n.toLocaleString()}` },
];

export function ValueProof() {
  return (
    <Section id="value">
      <SectionHeading
        align="left"
        eyebrow="What actually matters"
        title="Stop optimizing for traffic alone."
        body="Two landing pages from the same property. One gets nearly two and a half times the traffic. The other earns almost eight times the revenue."
        className="mb-12"
      />

      <MeshGrid className="sm:grid-cols-2">
        <PageCard
          name="/best-time-to-visit-santorini"
          kind="Informational guide"
          verdict="High traffic, thin value"
          stats={STATS.map((s) => ({ ...s, value: s.a, wins: !s.vanity && s.a > s.b }))}
          max={STATS}
        />
        <PageCard
          name="/santorini/hotels"
          kind="Commercial landing page"
          verdict="Deserves more attention"
          highlight
          stats={STATS.map((s) => ({ ...s, value: s.b, wins: !s.vanity && s.b > s.a }))}
          max={STATS}
        />
      </MeshGrid>
    </Section>
  );
}

function PageCard({
  name,
  kind,
  verdict,
  stats,
  max,
  highlight = false,
}: {
  name: string;
  kind: string;
  verdict: string;
  stats: (PageStat & { value: number; wins: boolean })[];
  max: PageStat[];
  highlight?: boolean;
}) {
  return (
    <div className="bg-surface p-6 sm:p-7">
      <span className="kicker">{kind}</span>
      <p className="mt-2 truncate font-mono text-sm text-fg">{name}</p>

      <dl className="mt-6 space-y-4">
        {stats.map((stat, i) => {
          const ceiling = Math.max(max[i]!.a, max[i]!.b);
          const pct = Math.max(4, (stat.value / ceiling) * 100);
          return (
            <div key={stat.label}>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-xs text-muted">{stat.label}</dt>
                <dd
                  className={cn(
                    "stat-value text-base tabular-nums",
                    stat.wins ? "text-fg" : "text-subtle",
                  )}
                >
                  {stat.format(stat.value)}
                </dd>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-subtle-surface">
                <div
                  className={cn("h-full rounded-full", stat.wins ? "bg-brand" : "bg-border-strong")}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </dl>

      <p
        className={cn(
          "mt-6 border-t border-hairline pt-4 text-sm font-medium",
          highlight ? "text-brand" : "text-subtle",
        )}
      >
        {verdict}
      </p>
    </div>
  );
}
