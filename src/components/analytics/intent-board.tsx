import { Button } from "@/components/ui/button";
import { VisitorAvatar } from "@/components/analytics/visitor-marker";
import { CHANNEL_BY_ID } from "@/lib/analytics/channels";
import { type LivePerson } from "@/lib/analytics/realtime";
import {
  sessionToTraceInput,
  traceIntent,
  type IntentTrace,
} from "@/lib/analytics/trace-intent";
import { useAnalytics } from "@/lib/analytics/store";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

export function IntentBoard() {
  const { people } = useRealtime();
  const lost = useMemo(
    () =>
      people.filter(
        (person) =>
          person.events.some((event) => event.kind === "exit") ||
          person.pages.length <= 1 ||
          !person.found,
      ),
    [people],
  );
  const sessionId = useAnalytics((s) => s.sessionId);
  const setSessionId = useAnalytics((s) => s.setSessionId);
  const selected = lost.find((session) => session.id === sessionId) ?? lost[0];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trace, setTrace] = useState<IntentTrace | null>(null);
  const [tracedId, setTracedId] = useState<string | null>(null);

  const runTrace = async (session: LivePerson) => {
    setBusy(true);
    setError(null);
    try {
      const result = await traceIntent({
        data: sessionToTraceInput({
          ...session,
          name: session.city,
        }),
      });
      setTrace(result.trace);
      setTracedId(session.id);
      if (!result.ok) setError(result.error);
    } catch {
      setError("Could not reach the model.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      <div className="min-h-0 flex-1 overflow-y-auto border-b border-border lg:border-r lg:border-b-0">
        <div className="px-4 py-3">
          <p className="text-xs tracking-wide text-muted uppercase">Lost intent</p>
          <p className="font-display text-xl text-fg">{lost.length} real sessions stalled or left</p>
          <p className="mt-1 text-sm text-muted">
            Reconstruct the query they came with, and where they go next.
          </p>
        </div>
        <ul>
          {lost.length === 0 && (
            <li className="px-4 py-8 text-sm text-subtle">No lost sessions in this stream yet.</li>
          )}
          {lost.map((session) => {
            const channel = CHANNEL_BY_ID[session.channelId];
            const active = selected?.id === session.id;
            return (
              <li key={session.id}>
                <button
                  type="button"
                  onClick={() => setSessionId(session.id)}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors duration-150",
                    active ? "bg-surface" : "hover:bg-surface/60",
                  )}
                >
                  <VisitorAvatar person={session} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm text-fg">{session.city}</p>
                    <p className="truncate text-xs text-muted">
                      {channel?.name ?? session.source} · {session.countryName}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-subtle">{session.title}</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {selected && (
        <aside className="flex min-h-0 w-full flex-col overflow-y-auto p-5 lg:w-96">
          <p className="text-xs tracking-wide text-muted uppercase">Session</p>
          <p className="font-display text-2xl text-fg">{selected.city}</p>
          <p className="mt-1 text-sm text-muted">
            {selected.device} · {selected.lang} · {selected.path}
          </p>
          <Button className="mt-4" onClick={() => void runTrace(selected)} disabled={busy}>
            {busy ? "Tracing…" : "Trace with Grok"}
          </Button>
          {error && <p className="mt-2 text-xs text-danger">{error}</p>}
          {trace && tracedId === selected.id && (
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
              <p className="text-fg">{trace.lookingFor}</p>
              <p>{trace.serp}</p>
              <p>{trace.gap}</p>
              <p>{trace.nextDestination}</p>
            </div>
          )}
        </aside>
      )}
    </div>
  );
}
