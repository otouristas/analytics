const NOW = [
  {
    title: "Earth atlas",
    body: "A navigable globe with choropleth countries, live visitor lights, and a one-click flip back to the flat map.",
  },
  {
    title: "First-class AI sources",
    body: "Grok, ChatGPT, Perplexity, Claude, Gemini, Copilot, Meta AI, and Apple Intelligence — scored on quality, not lumped into referral.",
  },
  {
    title: "X as a channel",
    body: "Organic X and X Ads sit beside LinkedIn and Reddit, with conversion and growth instead of vanity volume.",
  },
  {
    title: "Lost-intent reconstruction",
    body: "Grok rebuilds the SERP or chat that sent someone, what they wanted, and where they go when the page fails.",
  },
  {
    title: "Query the snapshot",
    body: "Ask the workspace in English. Reports write themselves when you press the button — never on page load.",
  },
];

const NEXT = [
  {
    title: "Voice morning brief",
    body: "Grok reads the overnight brief aloud. One tap, ninety seconds, no dashboard open.",
  },
  {
    title: "Session replay, privacy first",
    body: "See the path a lost visitor took, with fields already masked. Jump from a live avatar into the tape.",
  },
  {
    title: "Competitive SERP watch",
    body: "Nightly capture of the Google and Grok answers for your money queries, with rank and citation drift.",
  },
  {
    title: "Multi-touch on a globe",
    body: "Draw the first-Grok, last-X path as arcs between cities. Attribution you can spin.",
  },
  {
    title: "Anomaly radar",
    body: "When Perplexity conversion halves in Germany at 2am, Meridian pages you before the standup.",
  },
  {
    title: "Warehouse sync",
    body: "Same model in BigQuery or Snowflake. The globe stays the interface; SQL stays optional.",
  },
];

export function LabBoard() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <section className="border-b border-border px-5 py-6">
        <p className="text-xs tracking-wide text-muted uppercase">Lab</p>
        <h2 className="max-w-2xl font-display text-3xl text-fg">The best analytics tool is the one that knows why someone arrived — and why they left.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          GA4 counts sessions. Meridian names the assistant, reconstructs the query, shows the page they saw, and
          puts it on a globe. Below is what is live, and what we build next.
        </p>
      </section>
      <section className="grid gap-px bg-border lg:grid-cols-2">
        <article className="bg-bg p-5">
          <h3 className="text-xs tracking-wide text-muted uppercase">Live now</h3>
          <ul className="mt-4 space-y-5">
            {NOW.map((item) => (
              <li key={item.title}>
                <p className="text-sm font-medium text-fg">{item.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </article>
        <article className="bg-bg p-5">
          <h3 className="text-xs tracking-wide text-muted uppercase">Next</h3>
          <ul className="mt-4 space-y-5">
            {NEXT.map((item) => (
              <li key={item.title}>
                <p className="text-sm font-medium text-fg">{item.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
