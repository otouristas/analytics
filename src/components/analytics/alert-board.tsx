import { isConversionEvent } from "@/lib/analytics/ingest";
import { alerts } from "@/lib/analytics/insights";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { useMemo } from "react";

export function AlertBoard() {
  const { live, people, pages, status, project } = useRealtime();
  const conversions = people.filter((person) => person.events.some(isConversionEvent)).length;
  const rows = useMemo(
    () =>
      alerts({
        live: live.length,
        people: people.length,
        conversions,
        status,
        pages: pages.length,
      }),
    [live.length, people.length, conversions, status, pages.length],
  );

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <section className="border-b border-border px-5 py-5">
        <p className="kicker">Alerts · {project.host}</p>
        <h2 className="mt-1 font-display text-3xl italic tracking-tight text-fg">Pulse checks</h2>
        <p className="mt-1 text-sm text-muted">Rules on this stream only. No prior-period math until the warehouse has history.</p>
      </section>
      <ul>
        {rows.map((row) => (
          <li key={row.title} className="border-b border-border px-5 py-4">
            <p className="kicker">{row.level}</p>
            <p className="mt-1 text-fg">{row.title}</p>
            <p className="mt-1 text-sm text-muted">{row.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
