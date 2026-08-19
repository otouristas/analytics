import { ChannelLogo } from "@/components/analytics/channel-logo";
import { JourneySankey } from "@/components/analytics/journey-sankey";
import { CHANNEL_BY_ID } from "@/lib/analytics/channels";
import { summarize, type IngestEvent } from "@/lib/analytics/ingest";
import { formatPct } from "@/lib/analytics/model";
import { PROJECT_BY_ID } from "@/lib/analytics/projects";
import { useAnalytics } from "@/lib/analytics/store";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { PropertyHeader } from "@/components/product/property-header";
import { useEffect, useMemo, useState } from "react";

export function FlowBoard() {
  const { events, live, people } = useRealtime();
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
    <div className="min-h-0 flex-1 overflow-y-auto dock-safe">
      <PropertyHeader
        eyebrow="How visitors move"
        title="Customer Journeys"
        subtitle="Entry, exploration and outcome for every session in this stream."
        kpis={[
          { label: "Live users", value: String(live.length), delta: "last 90s" },
          { label: "Sessions", value: String(people.length), delta: "this stream" },
          {
            label: "Clicks",
            value: String(stats.clicks),
            delta: `${stats.internal} in · ${stats.outbound} out`,
          },
          { label: "Exits", value: String(stats.exits), delta: "session end" },
        ]}
      />

      {warehouse && warehouse.journeys.length > stats.journeys.length && (
        <p className="border-b border-hairline px-5 py-2 text-xs text-subtle">
          {warehouse.journeys.length} journeys stored in the warehouse, beyond this live buffer.
        </p>
      )}

      <section className="border-b border-hairline p-5">
        <SectionTitle kicker="Journey funnel flow" title="Multi-stage flow and drop-off" />
        <div className="mt-4">
          <JourneySankey people={people} />
        </div>
      </section>

      <section className="grid gap-px border-t border-hairline bg-hairline lg:grid-cols-3">
        <List title="Sources" rows={stats.sources} resolve={(id) => CHANNEL_BY_ID[id]?.name ?? id} />
        <List title="Countries" rows={stats.countries} />
        <List title="Devices" rows={stats.devices} />
      </section>

      <section className="grid gap-px border-t border-hairline bg-hairline lg:grid-cols-3">
        <List title="Queries" rows={stats.queries} empty="No search or utm terms yet" />
        <List title="Landings" rows={stats.landings} />
        <List title="Exit pages" rows={stats.exitPages} />
      </section>

      <section className="grid gap-px border-t border-hairline bg-hairline lg:grid-cols-2">
        <article className="bg-bg p-5">
          <SectionTitle kicker="Flow" title="Page to page" />
          <ul className="mt-4 space-y-2">
            {stats.flows.length === 0 && (
              <li className="text-sm text-subtle">Need two pages in one session.</li>
            )}
            {/* Capped. Unbounded, this rendered 60+ rows whose value was almost
                always 1 — a long tail of single traversals that buries the
                handful of transitions anyone would act on. */}
            {stats.flows.slice(0, FLOW_LIMIT).map((row) => (
              <li key={row.label} className="flex justify-between gap-3 text-sm">
                <span className="truncate font-mono text-xs text-fg">{row.label}</span>
                <span className="font-mono text-xs tabular-nums text-muted">{row.value}</span>
              </li>
            ))}
          </ul>
          {stats.flows.length > FLOW_LIMIT && (
            <p className="caption mt-3">
              {stats.flows.length - FLOW_LIMIT} more transitions, each seen{" "}
              {stats.flows[FLOW_LIMIT]?.value ?? 1} time
              {(stats.flows[FLOW_LIMIT]?.value ?? 1) === 1 ? "" : "s"} or fewer.
            </p>
          )}
        </article>
        <article className="bg-bg p-5">
          <SectionTitle kicker="Clicks" title="Inside and outbound" />
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

      <section className="border-t border-hairline bg-bg p-5">
        <SectionTitle kicker="User paths" title="Latest sessions" />
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
              <JourneyPath pages={journey.pages} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/** How many page-to-page transitions to list before the single-hit tail. */
const FLOW_LIMIT = 12;

/** How many steps of a single session's path to print before eliding. */
const PATH_HEAD = 4;
const PATH_TAIL = 2;

/**
 * One session's page path, elided in the middle.
 *
 * A crawler can traverse sixty-plus pages in a session, and printing that in
 * full produced a twenty-line block of mono text that dominated the board and
 * buried every ordinary session under it. The first few steps and the last few
 * are what a person reads anyway.
 */
function JourneyPath({ pages }: { pages: string[] }) {
  if (pages.length <= PATH_HEAD + PATH_TAIL + 1) {
    return (
      <p className="mt-2 font-mono text-xs leading-relaxed text-fg">{pages.join(" → ")}</p>
    );
  }

  const head = pages.slice(0, PATH_HEAD);
  const tail = pages.slice(-PATH_TAIL);
  const hidden = pages.length - head.length - tail.length;

  return (
    <p className="mt-2 font-mono text-xs leading-relaxed text-fg">
      {head.join(" → ")}
      <span className="text-subtle"> → … {hidden} more → </span>
      {tail.join(" → ")}
      <span className="caption ml-2">({pages.length} pages)</span>
    </p>
  );
}

function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div>
      <span className="kicker">{kicker}</span>
      <h3 className="heading-md mt-1">{title}</h3>
    </div>
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
