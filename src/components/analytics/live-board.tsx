import { CHANNEL_BY_ID } from "@/lib/analytics/channels";
import { PROJECT_BY_ID } from "@/lib/analytics/projects";
import { type LivePerson } from "@/lib/analytics/realtime";
import { useAnalytics } from "@/lib/analytics/store";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { ChannelLogo } from "@/components/analytics/channel-logo";
import { VisitorAvatar } from "@/components/analytics/visitor-marker";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

export function LiveBoard() {
  const sourceId = useAnalytics((s) => s.sourceId);
  const setSourceId = useAnalytics((s) => s.setSourceId);
  const sessionId = useAnalytics((s) => s.sessionId);
  const setSessionId = useAnalytics((s) => s.setSessionId);
  const { live, people, status, project } = useRealtime();

  const rows = useMemo(() => {
    const pool = live.length ? live : people;
    return sourceId ? pool.filter((session) => session.channelId === sourceId) : pool;
  }, [live, people, sourceId]);

  const selected = rows.find((session) => session.id === sessionId) ?? rows[0];

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="page-head">
          <div>
            <p className="kicker">Live now · {project.name}</p>
            <p className="display-stat mt-2 text-6xl text-fg">{live.length}</p>
            <p className="page-dek">
              {status === "empty" && "No real visitors yet."}
              {status === "connecting" && "Connecting to the site feed…"}
              {status === "error" && "Cannot reach the site feed."}
              {status === "live" &&
                `${live.length} on site now · ${people.length} sessions in this stream`}
            </p>
          </div>
          {sourceId && (
            <button
              type="button"
              onClick={() => setSourceId(null)}
              className="h-8 rounded-md bg-elevated px-3 text-xs text-fg"
            >
              Clear {CHANNEL_BY_ID[sourceId]?.name ?? sourceId}
            </button>
          )}
        </div>
        <ul>
          {rows.length === 0 && (
            <li className="px-4 py-10 text-sm text-subtle">
              Unique visitors on {project.host} appear here. Heartbeats do not count as extra people.
            </li>
          )}
          {rows.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              active={selected?.id === session.id}
              onSelect={() => setSessionId(session.id)}
            />
          ))}
        </ul>
      </div>

      {selected && (
        <aside className="border-t border-border lg:w-96 lg:border-t-0 lg:border-l">
          <SeeingPane session={selected} />
        </aside>
      )}
    </div>
  );
}

function SessionRow({
  session,
  active,
  onSelect,
}: {
  session: LivePerson;
  active: boolean;
  onSelect: () => void;
}) {
  const channel = CHANNEL_BY_ID[session.channelId];
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150",
          active ? "bg-surface" : "hover:bg-surface/60",
        )}
      >
        <VisitorAvatar person={session} live />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <p className="truncate text-sm text-fg">{session.city}</p>
            <span className="truncate text-xs text-subtle">{session.countryName}</span>
          </div>
          <p className="truncate text-xs text-muted">
            <span className="mr-1 inline-flex align-middle">
              <ChannelLogo id={session.source} size="sm" />
            </span>
            {channel?.name ?? session.source} · {session.title}
          </p>
        </div>
        <span className="hidden font-mono text-xs text-subtle tabular-nums sm:inline">
          {ago(session.lastTs)}
        </span>
      </button>
    </li>
  );
}

function SeeingPane({ session }: { session: LivePerson }) {
  const channel = CHANNEL_BY_ID[session.channelId];
  const host = PROJECT_BY_ID[useAnalytics.getState().projectId]?.host ?? "discovercyclades.gr";
  const url = `https://${host}${session.path}`;
  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-5">
      <div className="flex items-center gap-3">
        <VisitorAvatar person={session} live />
        <div>
          <p className="text-sm font-medium text-fg">
            {session.city}, {session.countryName}
          </p>
          <p className="flex items-center gap-2 text-xs text-muted">
            <ChannelLogo id={session.source} size="sm" />
            {channel?.name ?? session.source} · {session.device} · {session.os} · {session.browser}
          </p>
        </div>
      </div>

      <div className="glass overflow-hidden rounded-xl">
        <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
          <span className="size-1.5 rounded-full bg-border-strong" />
          <span className="size-1.5 rounded-full bg-border-strong" />
          <span className="size-1.5 rounded-full bg-border-strong" />
          <span className="ml-2 truncate font-mono text-xs text-subtle">
            {host}
            {session.path}
          </span>
          <button
            type="button"
            className="ml-auto text-xs text-muted hover:text-fg"
            onClick={() => void navigator.clipboard.writeText(url)}
          >
            Copy
          </button>
        </div>
        <div className="space-y-2 p-4">
          <p className="font-display text-xl italic text-fg">{session.title}</p>
          <p className="font-mono text-xs text-subtle">{session.path}</p>
          <p className="text-xs text-muted">{session.lang} · {session.device}</p>
        </div>
      </div>

      <div>
        <p className="text-xs tracking-wide text-muted uppercase">Arrived via</p>
        <p className="mt-1 text-sm text-fg">{channel?.name ?? session.source}</p>
        {session.query && session.query !== session.source && (
          <p className="mt-1 text-sm leading-relaxed text-muted">“{session.query}”</p>
        )}
      </div>

      <div>
        <p className="text-xs tracking-wide text-muted uppercase">Path</p>
        <ol className="mt-2 space-y-1">
          {session.pages.map((path, index) => (
            <li key={`${path}-${index}`} className="truncate font-mono text-xs text-muted">
              {index + 1}. {path}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-auto flex items-center justify-between text-xs">
        <span className={session.found ? "text-positive" : "text-danger"}>
          {session.found ? "Still on site" : "Exited"}
        </span>
        <span className="font-mono tabular-nums text-subtle">{ago(session.lastTs)}</span>
      </div>
    </div>
  );
}

function ago(ts: number) {
  const sec = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.round(sec / 60)}m`;
  return `${Math.round(sec / 3600)}h`;
}
