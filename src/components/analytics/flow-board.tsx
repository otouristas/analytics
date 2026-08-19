import { ChannelLogo } from "@/components/analytics/channel-logo";
import { CHANNEL_BY_ID } from "@/lib/analytics/channels";
import { summarize, type IngestEvent } from "@/lib/analytics/ingest";
import { formatPct } from "@/lib/analytics/model";
import { PROJECT_BY_ID } from "@/lib/analytics/projects";
import { useAnalytics } from "@/lib/analytics/store";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { useEffect, useMemo, useState } from "react";

export function FlowBoard() {
  const { events, status, project, live, people } = useRealtime();
  const projectId = useAnalytics((s) => s.projectId);
  const writeKey = PROJECT_BY_ID[projectId].writeKey;
  const [history, setHistory] = useState<IngestEvent[]>([]);
  const stats = useMemo(() => summarize(events), [events]);
  const warehouse = useMemo(() => (history.length ? summarize(history) : null), [history]);

  useEffect(() => {
    void fetch(`/api/history?key=${encodeURIComponent(writeKey)}`)
      .then((res) => res.json())
      .then((body: { events?: IngestEvent[] }) => setHistory(body.events ?? []))
      .catch(() => undefined);
  }, [writeKey]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="border-b border-border px-5 py-4">
        <p className="kicker">{project.host}</p>
        <p className="display-stat mt-1 text-4xl text-fg">{live.length}</p>
        <p className="mt-2 text-sm text-muted">{project.name}</p>
          {warehouse && warehouse.journeys.length > stats.journeys.length && (
            <p className="mt-2 text-xs text-subtle">
              Warehouse {warehouse.journeys.length} journeys stored (beyond this live buffer).
            </p>
          )}
      </div>
      <section className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="Live users" value={String(live.length)} hint="unique, last 90s" />
        <Stat label="Sessions" value={String(people.length)} hint="this stream" />
        <Stat label="All clicks" value={String(stats.clicks)} hint={`${stats.internal} in · ${stats.outbound} out`} />
        <Stat label="Outbound" value={String(stats.outbound)} hint="left the site" />
        <Stat label="Exits" value={String(stats.exits)} hint="session end" />
      </section>

      <section className="grid gap-px border-t border-border bg-border lg:grid-cols-3">
        <List title="Sources" rows={stats.sources} resolve={(id) => CHANNEL_BY_ID[id]?.name ?? id} />
        <List title="Countries" rows={stats.countries} />
        <List title="Devices" rows={stats.devices} />
      </section>

      <section className="grid gap-px border-t border-border bg-border lg:grid-cols-3">
        <List title="Queries" rows={stats.queries} empty="No search or utm terms yet" />
        <List title="Landings" rows={stats.landings} />
        <List title="Exit pages" rows={stats.exitPages} />
      </section>

      <section className="grid gap-px border-t border-border bg-border lg:grid-cols-2">
        <article className="bg-bg p-5">
          <h3 className="text-xs tracking-wide text-muted uppercase">Flow</h3>
          <p className="mt-1 font-display text-lg text-fg">Page to page</p>
          <ul className="mt-4 space-y-2">
            {stats.flows.length === 0 && <li className="text-sm text-subtle">Need two pages in one session.</li>}
            {stats.flows.map((row) => (
              <li key={row.label} className="flex justify-between gap-3 text-sm">
                <span className="truncate font-mono text-xs text-fg">{row.label}</span>
                <span className="font-mono text-xs tabular-nums text-muted">{row.value}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="bg-bg p-5">
          <h3 className="text-xs tracking-wide text-muted uppercase">Clicks</h3>
          <p className="mt-1 font-display text-lg text-fg">Inside and outbound</p>
          <ul className="mt-4 space-y-2">
            {stats.clickLabels.length === 0 && <li className="text-sm text-subtle">Click anything on the test site.</li>}
            {stats.clickLabels.slice(0, 8).map((row) => (
              <li key={row.label} className="flex justify-between gap-3 text-sm">
                <span className="truncate text-fg">{row.label}</span>
                <span className="font-mono text-xs tabular-nums text-muted">{row.value}</span>
              </li>
            ))}
          </ul>
          {stats.outboundHrefs[0] && (
            <p className="mt-4 text-xs text-muted">
              Top outbound {stats.outboundHrefs[0].label}
            </p>
          )}
        </article>
      </section>

      <section className="border-t border-border bg-bg p-5">
        <h3 className="text-xs tracking-wide text-muted uppercase">User paths</h3>
        <p className="mt-1 font-display text-lg text-fg">Latest sessions</p>
        <ul className="mt-4 space-y-3">
          {stats.journeys.length === 0 && <li className="text-sm text-subtle">No sessions in this stream yet.</li>}
          {stats.journeys.map((journey) => (
            <li key={journey.sessionId} className="text-sm">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                <ChannelLogo id={journey.source} size="sm" />
                <span className="text-fg">{CHANNEL_BY_ID[journey.source]?.name ?? journey.source}</span>
                <span>{journey.country}</span>
                <span>{journey.device}</span>
              </div>
              <p className="mt-2 font-mono text-xs leading-relaxed text-fg">
                {journey.pages.join(" → ")}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className="bg-bg p-5">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-mono text-2xl tabular-nums tracking-tight text-fg">{value}</p>
      <p className="mt-1 text-xs text-subtle">{hint}</p>
    </article>
  );
}

function List({
  title,
  rows,
  resolve,
  empty,
}: {
  title: string;
  rows: { label: string; value: number }[];
  resolve?: (label: string) => string;
  empty?: string;
}) {
  const total = rows.reduce((sum, row) => sum + row.value, 0) || 1;
  return (
    <article className="bg-bg p-5">
      <h3 className="text-xs tracking-wide text-muted uppercase">{title}</h3>
      <ul className="mt-4 space-y-2">
        {rows.length === 0 && <li className="text-sm text-subtle">{empty ?? "Waiting for hits."}</li>}
        {rows.slice(0, 6).map((row) => (
          <li key={row.label}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="truncate text-fg">{resolve ? resolve(row.label) : row.label}</span>
              <span className="font-mono tabular-nums text-muted">
                {row.value} · {formatPct(row.value / total)}
              </span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-elevated">
              <div className="h-full rounded-full bg-map-5" style={{ width: `${(row.value / total) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}
