import { ExportBar } from "@/components/analytics/export-bar";
import { PageShell } from "@/components/analytics/page-shell";
import { isConversionEvent, summarize } from "@/lib/analytics/ingest";
import { useAnalytics } from "@/lib/analytics/store";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { useMemo } from "react";

const KIND_TONE: Record<string, string> = {
  pageview: "text-map-6",
  click: "text-fg",
  outbound: "text-positive",
  exit: "text-danger",
  form: "text-chart",
  conversion: "text-positive",
};

export function EventsBoard({ conversionsOnly = false }: { conversionsOnly?: boolean }) {
  const { events, project } = useRealtime();
  const conversionContains = useAnalytics((s) => s.conversionContains);
  const setConversionContains = useAnalytics((s) => s.setConversionContains);
  const stats = useMemo(() => summarize(events), [events]);
  const conversions = events.filter(
    (event) =>
      isConversionEvent(event) ||
      (conversionContains && `${event.path} ${event.href} ${event.label}`.includes(conversionContains)),
  );
  const kinds = conversionsOnly
    ? [{ label: "conversion", value: conversions.length }]
    : [
        { label: "pageview", value: stats.pageviews },
        { label: "click", value: stats.internal },
        { label: "outbound", value: stats.outbound },
        { label: "exit", value: stats.exits },
        { label: "form", value: events.filter((event) => event.kind === "form").length },
      ].filter((row) => row.value > 0);

  const rows = conversionsOnly
    ? conversions.slice(0, 40)
    : events.filter((event) => event.kind !== "heartbeat").slice(0, 40);

  return (
    <PageShell
      kicker={`${conversionsOnly ? "Conversions" : "Events"} · ${project.host}`}
      title={conversionsOnly ? "What counted as a conversion" : "The collector log"}
      dek={
        conversionsOnly
          ? "Booking/partner/outbound heuristics until you define rules."
          : "Heartbeats hidden. Each row is a real action."
      }
      actions={
        <>
          {conversionsOnly && (
            <label className="text-xs text-muted">
              Path contains
              <input
                value={conversionContains}
                onChange={(event) => setConversionContains(event.target.value)}
                className="ml-2 h-8 rounded-md bg-elevated px-2 text-xs text-fg outline-none"
              />
            </label>
          )}
          <ExportBar />
        </>
      }
    >
      <section className="grid gap-px border-b border-border bg-border sm:grid-cols-2 xl:grid-cols-5">
        {kinds.map((row) => (
          <div key={row.label} className="bg-bg px-5 py-4">
            <p className="kicker">{row.label}</p>
            <p className={`display-stat mt-1 text-3xl ${KIND_TONE[row.label] ?? "text-fg"}`}>{row.value}</p>
          </div>
        ))}
      </section>
      <ul>
        {rows.length === 0 && (
          <li className="px-5 py-10 text-sm text-subtle">
            {conversionsOnly ? "No conversion-like events in this stream." : "No events yet."}
          </li>
        )}
        {rows.map((event) => (
          <li key={event.id} className="grid grid-cols-[6.5rem_1fr_auto] items-baseline gap-3 border-b border-border px-4 py-3 text-sm">
            <span className={`kicker ${KIND_TONE[event.kind] ?? "text-subtle"}`}>{event.kind}</span>
            <span className="min-w-0">
              <span className="block truncate text-fg">{event.title || event.path}</span>
              <span className="block truncate font-mono text-xs text-subtle">{event.path}</span>
            </span>
            <span className="shrink-0 text-xs text-muted">
              {event.countryName} · {event.source}
            </span>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
