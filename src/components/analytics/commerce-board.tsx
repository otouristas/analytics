import { commerce } from "@/lib/analytics/insights";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { useMemo } from "react";

export function CommerceBoard() {
  const { events, project } = useRealtime();
  const data = useMemo(() => commerce(events), [events]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <section className="border-b border-border px-5 py-5">
        <p className="kicker">Revenue · {project.host}</p>
        <h2 className="mt-1 font-display text-3xl italic tracking-tight text-fg">Ecommerce events</h2>
        <p className="mt-1 text-sm text-muted">
          Purchases only appear when the site calls meridian.revenue() or track("purchase"). Client revenue is not trusted over a server event.
        </p>
      </section>
      <p className="display-stat px-5 pt-6 text-5xl text-fg">{data.orders}</p>
      <p className="px-5 text-xs text-subtle">Orders in this stream</p>
      <ul className="mt-6">
        {data.events.length === 0 && (
          <li className="px-5 py-8 text-sm text-subtle">No purchase events yet. Discover Cyclades is content-led — this stays at zero until checkout is instrumented.</li>
        )}
        {data.events.map((event) => (
          <li key={event.id} className="border-t border-border px-5 py-3 text-sm">
            {event.title} · {event.path}
          </li>
        ))}
      </ul>
    </div>
  );
}
