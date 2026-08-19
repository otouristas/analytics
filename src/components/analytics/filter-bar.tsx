import { ChannelLogo } from "@/components/analytics/channel-logo";
import { STREAM_WINDOWS } from "@/lib/analytics/insights";
import { useAnalytics } from "@/lib/analytics/store";
import { cn } from "@/lib/utils";

export function FilterBar() {
  const streamWindow = useAnalytics((s) => s.streamWindow);
  const setStreamWindow = useAnalytics((s) => s.setStreamWindow);
  const deviceFilter = useAnalytics((s) => s.deviceFilter);
  const setDeviceFilter = useAnalytics((s) => s.setDeviceFilter);
  const channelFilter = useAnalytics((s) => s.channelFilter);
  const setChannelFilter = useAnalytics((s) => s.setChannelFilter);
  const pathFilter = useAnalytics((s) => s.pathFilter);
  const setPathFilter = useAnalytics((s) => s.setPathFilter);

  return (
    <div className="glass-thin thin-scroll flex h-12 items-center gap-2 overflow-x-auto px-3 sm:px-4">
      <div className="seg shrink-0">
        {STREAM_WINDOWS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setStreamWindow(item.id)}
            className={cn("chip", streamWindow === item.id && "is-on")}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="seg shrink-0">
        {(["all", "desktop", "mobile"] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setDeviceFilter(id)}
            className={cn("chip capitalize", deviceFilter === id && "is-on")}
          >
            {id}
          </button>
        ))}
      </div>
      <input
        value={pathFilter}
        onChange={(event) => setPathFilter(event.target.value)}
        placeholder="Path contains…"
        className="h-8 w-44 shrink-0 rounded-full bg-elevated px-3 text-xs text-fg outline-none placeholder:text-subtle"
      />
      <div className="flex shrink-0 items-center gap-1">
        {["google", "chatgpt", "grok", "perplexity", "claude", "bing", "yahoo", "facebook", "instagram", "reddit", "x"].map(
          (id) => (
            <button
              key={id}
              type="button"
              title={id}
              onClick={() => setChannelFilter(channelFilter === id ? "all" : id)}
              className={cn(
                "rounded-md p-0.5 transition-opacity duration-150",
                channelFilter === id ? "bg-fg/10" : "opacity-70 hover:opacity-100",
              )}
            >
              <ChannelLogo id={id} size="sm" />
            </button>
          ),
        )}
      </div>
    </div>
  );
}
