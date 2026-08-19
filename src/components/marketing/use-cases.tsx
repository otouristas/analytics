import { Section, SectionHeading, MeshGrid } from "@/components/ui/primitives";

/**
 * Who this is for, in their own words. Deliberately plain text on the hairline
 * mesh — six icons here would add decoration without adding information.
 */

const CASES: { team: string; claim: string }[] = [
  { team: "SEO teams", claim: "Know which rankings actually matter." },
  { team: "Growth teams", claim: "Connect acquisition to traffic quality." },
  { team: "Ecommerce", claim: "Follow traffic through product to revenue." },
  { team: "Agencies", claim: "Run every client property from one workspace." },
  { team: "Travel", claim: "Read destination and booking demand as it shifts." },
  { team: "SaaS", claim: "Find the activation and conversion leaks." },
];

export function UseCases() {
  return (
    <Section id="use-cases">
      <SectionHeading
        align="left"
        eyebrow="Who it's for"
        title="Built for the people who own the number."
        className="mb-12"
      />

      <MeshGrid className="sm:grid-cols-2 lg:grid-cols-3">
        {CASES.map((item) => (
          <div key={item.team} className="bg-surface p-6 transition-colors hover:bg-surface-raised">
            <span className="eyebrow">{item.team}</span>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-fg">{item.claim}</p>
          </div>
        ))}
      </MeshGrid>
    </Section>
  );
}
