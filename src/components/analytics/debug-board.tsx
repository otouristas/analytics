import { useRealtime } from "@/lib/analytics/use-live-feed";

export function DebugBoard() {
  const { events, status, project } = useRealtime();

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <section className="border-b border-border px-5 py-5">
        <p className="kicker">Debug · {status}</p>
        <h2 className="mt-1 font-display text-3xl italic tracking-tight text-fg">Incoming events</h2>
        <p className="mt-1 text-sm text-muted">{project.host} · {events.length} in the current window</p>
      </section>
      <ul>
        {events.length === 0 && <li className="px-5 py-10 text-sm text-subtle">Waiting for the collector.</li>}
        {events.slice(0, 80).map((event) => (
          <li key={event.id} className="border-b border-border px-5 py-3 font-mono text-xs">
            <span className="text-fg">{event.kind}</span>
            <span className="ml-2 text-muted">{event.path}</span>
            <span className="ml-2 text-subtle">
              {event.source} · {event.device} · {event.countryName} · {event.sessionId.slice(0, 8)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
