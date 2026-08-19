import { ChannelLogo } from "@/components/analytics/channel-logo";
import { ExportBar } from "@/components/analytics/export-bar";
import { PageShell } from "@/components/analytics/page-shell";
import { Sparkline } from "@/components/analytics/sparkline";
import { Button } from "@/components/ui/button";
import { writeLiveBrief } from "@/lib/analytics/ask";
import { CHANNEL_BY_ID } from "@/lib/analytics/channels";
import { goalStats } from "@/lib/analytics/goals";
import { compareHalves, coreMetrics, minuteSeries, trackingHealth } from "@/lib/analytics/insights";
import { formatDwellShort, formatPct } from "@/lib/analytics/visitor-name";
import { useAnalytics } from "@/lib/analytics/store";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { useEffect, useMemo, useRef, useState } from "react";

export function OverviewBoard() {
  const { live, people, stats, sources, pages, project, status, events } = useRealtime();
  const setView = useAnalytics((s) => s.setView);
  const goals = useMemo(() => goalStats(people), [people]);
  const core = useMemo(() => coreMetrics(people), [people]);
  const health = trackingHealth(events);
  const spark = minuteSeries(events, 30);
  const halves = compareHalves(events);
  const [brief, setBrief] = useState("");
  const lastBrief = useRef(0);

  useEffect(() => {
    if (people.length < 2) return;
    if (Date.now() - lastBrief.current < 45_000 && brief) return;
    lastBrief.current = Date.now();
    const snapshot = JSON.stringify({
      host: project.host,
      live: live.length,
      sessions: people.length,
      pageviews: stats.pageviews,
      goalPerVisitor: Math.round(goals.perVisitor * 1000) / 10,
      converted: goals.converted,
      goals: goals.rows.filter((row) => row.sessions).map((row) => [row.name, row.sessions]),
      sources: sources.slice(0, 8),
      pages: pages.slice(0, 8),
    });
    void writeLiveBrief({ data: { snapshot } }).then((result) => {
      if (result.text) setBrief(result.text);
    });
  }, [people.length, live.length, brief, goals, pages, project.host, sources, stats.pageviews]);

  const share = async () => {
    const url = `${window.location.origin}/s/${project.shareToken}`;
    await navigator.clipboard.writeText(url);
  };

  return (
    <PageShell
      kicker={`Pulse · ${project.host}`}
      title="Is the site making anything happen?"
      dek={
        status === "live"
          ? `${live.length} live · ${people.length} sessions · ${goals.converted} hit a named goal.`
          : "Waiting for the collector."
      }
      actions={
        <>
          <Button variant="outline" size="sm" onClick={() => void share()}>
            Copy share link
          </Button>
          <ExportBar />
          <Button variant="outline" size="sm" onClick={() => setView("atlas")}>
            Open Earth
          </Button>
        </>
      }
    >
      {brief && (
        <section className="border-b border-border px-5 py-5">
          <p className="kicker">Auto brief</p>
          <p className="mt-2 max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-fg">{brief}</p>
        </section>
      )}

      <section className="border-b border-border px-5 py-4">
        <Sparkline values={spark} />
        <p className="mt-1 text-xs text-subtle">Hits per minute, last 30 minutes of this stream</p>
        {halves && (
          <p className="mt-2 text-xs text-muted">
            Later half vs earlier: {halves.laterSessions} vs {halves.earlierSessions} sessions.
          </p>
        )}
      </section>

      <section className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-6">
        <PulseStat label="Visitors" value={String(core.visitors)} hint="unique sessions" />
        <PulseStat label="Pageviews" value={String(core.pageviews)} hint="hits" />
        <PulseStat label="Bounce" value={formatPct(core.bounce)} hint="single-page sessions" />
        <PulseStat label="Avg time" value={formatDwellShort(core.avgDuration)} hint="session duration" />
        <PulseStat
          label="Qualified"
          value={formatPct(core.qualifiedRate)}
          hint={`${core.qualified} sessions ≥ intent 20`}
        />
        <PulseStat label="Live" value={String(live.length)} hint="last 90 seconds" tone="live" />
      </section>

      <section className="grid gap-px border-t border-border bg-border lg:grid-cols-3">
        <List
          title="Channels"
          rows={sources.slice(0, 8).map(([id, value]) => ({
            id,
            label: CHANNEL_BY_ID[id]?.name ?? id,
            value,
          }))}
          onOpen={() => setView("sources")}
        />
        <List
          title="Pages"
          rows={pages.slice(0, 8).map((page) => ({ label: page.title, value: page.value }))}
          onOpen={() => setView("pages")}
        />
        <List
          title="Goals"
          rows={goals.rows
            .filter((row) => row.sessions)
            .map((row) => ({ label: row.name, value: row.sessions }))}
          onOpen={() => setView("conversions")}
        />
      </section>

      <section className="px-5 py-4">
        <p className="text-sm text-muted">
          Tracking {health.ok ? "healthy" : health.issues[0] ?? status} · {events.length} events in window.
        </p>
      </section>
    </PageShell>
  );
}

function PulseStat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "live";
}) {
  return (
    <article className="bg-bg px-5 py-5">
      <p className="kicker">{label}</p>
      <p className={`display-stat mt-2 text-4xl ${tone === "live" ? "text-positive" : "text-fg"}`}>{value}</p>
      <p className="mt-1 text-xs text-subtle">{hint}</p>
    </article>
  );
}

function List({
  title,
  rows,
  onOpen,
}: {
  title: string;
  rows: { id?: string; label: string; value: number }[];
  onOpen: () => void;
}) {
  return (
    <article className="bg-bg p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="kicker">{title}</h3>
        <button type="button" onClick={onOpen} className="text-xs text-muted hover:text-fg">
          Open
        </button>
      </div>
      <ul className="mt-4 space-y-3">
        {rows.length === 0 && <li className="text-sm text-subtle">Waiting for traffic.</li>}
        {rows.map((row) => (
          <li key={row.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              {row.id && <ChannelLogo id={row.id} size="sm" />}
              <span className="truncate text-fg">{row.label}</span>
            </span>
            <span className="shrink-0 font-mono text-xs tabular-nums text-muted">{row.value}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
