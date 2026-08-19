import { Button } from "@/components/ui/button";
import { ExportBar } from "@/components/analytics/export-bar";
import { writeLiveBrief } from "@/lib/analytics/ask";
import { CHANNEL_BY_ID } from "@/lib/analytics/channels";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { useState } from "react";

export function ReportBoard() {
  const { live, people, stats, sources, pages, project } = useRealtime();
  const [busy, setBusy] = useState(false);
  const [brief, setBrief] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setBusy(true);
    setError(null);
    try {
      const snapshot = JSON.stringify({
        host: project.host,
        live: live.length,
        sessions: people.length,
        pageviews: stats.pageviews,
        clicks: stats.clicks,
        outbound: stats.outbound,
        exits: stats.exits,
        countries: stats.countries.slice(0, 8),
        sources: sources.slice(0, 8),
        pages: pages.slice(0, 8),
        devices: stats.devices,
        now: live.slice(0, 6).map((person) => ({
          city: person.city,
          country: person.countryName,
          path: person.path,
          title: person.title,
          source: person.source,
          lang: person.lang,
        })),
      });
      const result = await writeLiveBrief({ data: { snapshot } });
      setBrief(result.text);
      if (!result.ok) setError(result.error);
    } catch {
      setError("Could not write the brief.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <section className="flex flex-wrap items-end justify-between gap-4 border-b border-border px-5 py-5">
        <div>
          <p className="kicker">Live report · {project.host}</p>
          <h2 className="font-display text-4xl italic tracking-tight text-fg">What is happening now</h2>
          <p className="mt-1 text-sm text-muted">
            {live.length} live · {people.length} sessions · numbers are real first-party hits
          </p>
        </div>
        <div className="flex gap-2">
          <ExportBar />
          <Button onClick={() => void generate()} disabled={busy}>
            {busy ? "Writing…" : "Brief this stream"}
          </Button>
        </div>
      </section>

      {brief && (
        <section className="border-b border-border px-5 py-5">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-fg">{brief}</p>
          {error && <p className="mt-2 text-xs text-danger">{error}</p>}
        </section>
      )}

      <section className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Live now" value={String(live.length)} hint="last 90s" />
        <Stat label="Sessions" value={String(people.length)} hint="stream" />
        <Stat label="Pageviews" value={String(stats.pageviews)} hint="hits" />
        <Stat label="Clicks" value={String(stats.clicks)} hint={`${stats.outbound} outbound`} />
      </section>

      <section className="grid gap-px border-t border-border bg-border lg:grid-cols-2">
        <article className="bg-bg p-5">
          <h3 className="text-xs tracking-wide text-muted uppercase">Sources</h3>
          <p className="mt-1 font-display text-lg text-fg">How they arrived</p>
          <ul className="mt-4 space-y-3">
            {sources.slice(0, 8).map(([id, count]) => (
              <li key={id} className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-fg">{CHANNEL_BY_ID[id]?.name ?? id}</span>
                <span className="font-mono text-xs tabular-nums text-muted">{count}</span>
              </li>
            ))}
            {sources.length === 0 && <li className="text-sm text-subtle">Waiting for traffic.</li>}
          </ul>
        </article>
        <article className="bg-bg p-5">
          <h3 className="text-xs tracking-wide text-muted uppercase">Pages</h3>
          <p className="mt-1 font-display text-lg text-fg">What they see</p>
          <ul className="mt-4 space-y-3">
            {pages.slice(0, 8).map((page) => (
              <li key={page.path} className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate text-fg">{page.title}</span>
                <span className="shrink-0 font-mono text-xs tabular-nums text-muted">{page.value}</span>
              </li>
            ))}
            {pages.length === 0 && <li className="text-sm text-subtle">Waiting for pageviews.</li>}
          </ul>
        </article>
      </section>

      <section className="grid gap-px border-t border-border bg-border lg:grid-cols-2">
        <article className="bg-bg p-5">
          <h3 className="text-xs tracking-wide text-muted uppercase">Countries</h3>
          <ul className="mt-4 space-y-3">
            {stats.countries.slice(0, 8).map((row) => (
              <li key={row.label} className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-fg">{row.label}</span>
                <span className="font-mono text-xs tabular-nums text-muted">{row.value}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="bg-bg p-5">
          <h3 className="text-xs tracking-wide text-muted uppercase">Devices</h3>
          <ul className="mt-4 space-y-3">
            {stats.devices.map((row) => (
              <li key={row.label} className="flex items-baseline justify-between gap-3 text-sm">
                <span className="capitalize text-fg">{row.label}</span>
                <span className="font-mono text-xs tabular-nums text-muted">{row.value}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className="bg-bg p-5">
      <p className="text-xs tracking-wide text-muted uppercase">{label}</p>
      <p className="mt-2 font-mono text-3xl tabular-nums tracking-tight text-fg">{value}</p>
      <p className="mt-1 text-xs text-subtle">{hint}</p>
    </article>
  );
}
