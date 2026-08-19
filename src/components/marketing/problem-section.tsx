import { Section, SectionHeading, MeshGrid } from "@/components/ui/primitives";

/**
 * The argument the whole product rests on: a dashboard reports a number, and a
 * number is not a finding.
 *
 * Each row shows the same event read twice. The left column is deliberately
 * typeset as flat, dead data — mono, muted, no interpretation — and the right
 * column as prose a person could act on. The contrast IS the content, so it
 * carries no illustration.
 */

interface Comparison {
  metric: string;
  dashboard: string;
  meridian: string;
}

const COMPARISONS: Comparison[] = [
  {
    metric: "Traffic",
    dashboard: "Traffic is down 18%.",
    meridian:
      "Qualified organic traffic fell 18%, almost entirely mobile sessions to three high-value landing pages. Desktop is flat.",
  },
  {
    metric: "Conversions",
    dashboard: "Conversions decreased.",
    meridian:
      "The conversion loss is concentrated in Safari sessions since the 12 Aug release. Other browsers are unchanged.",
  },
  {
    metric: "Search",
    dashboard: "Search clicks increased.",
    meridian:
      "Clicks rose 9%, but the added visitors convert at a third of your average. Rankings improved on informational queries, not commercial ones.",
  },
];

export function ProblemSection() {
  return (
    <Section id="problem">
      <SectionHeading
        align="left"
        eyebrow="The difference"
        title={
          <>
            Dashboards show numbers.
            <br />
            <span className="text-muted">Meridian explains the business.</span>
          </>
        }
        className="mb-12"
      />

      <MeshGrid className="lg:grid-cols-[7.5rem_1fr_1fr]">
        {/* Column headers, desktop only — on narrow screens each row is read as
            a stacked pair and the inline labels below carry the meaning. */}
        <div className="hidden bg-surface px-5 py-3 lg:block" />
        <div className="hidden bg-surface px-5 py-3 lg:block">
          <span className="kicker">Traditional analytics</span>
        </div>
        <div className="hidden bg-surface px-5 py-3 lg:block">
          <span className="eyebrow">Meridian</span>
        </div>

        {COMPARISONS.map((row) => (
          <ComparisonRow key={row.metric} row={row} />
        ))}
      </MeshGrid>
    </Section>
  );
}

function ComparisonRow({ row }: { row: Comparison }) {
  return (
    <>
      <div className="flex items-center bg-surface px-5 pb-2 pt-5 lg:py-6">
        <span className="kicker">{row.metric}</span>
      </div>

      <div className="bg-surface px-5 pb-5 pt-1 lg:py-6">
        <span className="kicker mb-2 block lg:hidden">Traditional analytics</span>
        <p className="font-mono text-sm leading-relaxed text-subtle">{row.dashboard}</p>
      </div>

      <div className="bg-surface px-5 pb-6 pt-1 lg:py-6">
        <span className="eyebrow mb-2 block lg:hidden">Meridian</span>
        <p className="text-sm leading-relaxed text-fg">{row.meridian}</p>
      </div>
    </>
  );
}
