import { ChannelLogo } from "@/components/analytics/channel-logo";
import { CHANNEL_BY_ID, CHANNELS, FAMILIES, type ChannelFamily } from "@/lib/analytics/channels";
import { sourceMetrics } from "@/lib/analytics/insights";
import { useAnalytics } from "@/lib/analytics/store";
import { formatPct } from "@/lib/analytics/visitor-name";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

export function SourceBoard() {
  const sourceId = useAnalytics((s) => s.sourceId);
  const setSourceId = useAnalytics((s) => s.setSourceId);
  const setView = useAnalytics((s) => s.setView);
  const [family, setFamily] = useState<ChannelFamily | "all">("all");
  const { people, sources, project } = useRealtime();
  const rates = useMemo(() => new Map(sourceMetrics(people).map((row) => [row.id, row])), [people]);
  const total = people.length || 1;
  const realIds = useMemo(() => new Set(sources.map(([id]) => id)), [sources]);

  const rows = CHANNELS.filter((channel) => {
    if (project.live && !realIds.has(channel.id) && channel.id !== "direct") {
      return sources.some(([id]) => id === channel.id);
    }
    if (family !== "all" && channel.family !== family) return false;
    if (project.live) return realIds.has(channel.id);
    return true;
  });

  const visible = project.live
    ? sources
        .map(([id, count]) => ({
          id,
          name: CHANNEL_BY_ID[id]?.name ?? id,
          mark: CHANNEL_BY_ID[id]?.mark ?? id.slice(0, 2).toUpperCase(),
          family: CHANNEL_BY_ID[id]?.family ?? "referral",
          count,
        }))
        .filter((row) => family === "all" || CHANNEL_BY_ID[row.id]?.family === family)
    : rows.map((channel) => ({
        id: channel.id,
        name: channel.name,
        mark: channel.mark,
        family: channel.family,
        count: 0,
      }));

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="flex flex-wrap items-center gap-1 border-b border-border px-3 py-2">
        <button
          type="button"
          onClick={() => setFamily("all")}
          className={cn(
            "h-8 rounded-md px-3 text-xs",
            family === "all" ? "bg-primary text-primary-fg" : "text-muted hover:bg-elevated hover:text-fg",
          )}
        >
          All channels
        </button>
        {FAMILIES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFamily(item.id)}
            className={cn(
              "h-8 rounded-md px-3 text-xs",
              family === item.id ? "bg-primary text-primary-fg" : "text-muted hover:bg-elevated hover:text-fg",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-4">
        {visible.length === 0 && (
          <p className="bg-bg px-5 py-10 text-sm text-subtle">No sources in this stream yet.</p>
        )}
        {visible.map((channel) => {
          const active = sourceId === channel.id;
          const share = channel.count / total;
          return (
            <button
              key={channel.id}
              type="button"
              onClick={() => {
                setSourceId(active ? null : channel.id);
                setView("live");
              }}
              className={cn(
                "bg-bg p-4 text-left transition-colors duration-150 hover:bg-surface",
                active && "bg-surface",
              )}
            >
              <div className="flex items-center gap-3">
                <ChannelLogo id={channel.id} size="lg" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-fg">{channel.name}</p>
                  <p className="text-xs text-muted capitalize">{channel.family}</p>
                </div>
              </div>
              <p className="mt-4 font-mono text-xl tabular-nums tracking-tight text-fg">{channel.count}</p>
              <p className="text-xs text-muted">
                {Math.round(share * 100)}% of sessions
                {rates.get(channel.id)
                  ? ` · ${formatPct(rates.get(channel.id)!.rate)} goals`
                  : ""}
              </p>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-elevated">
                <div className="h-full rounded-full bg-map-5" style={{ width: `${Math.max(6, share * 100)}%` }} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
