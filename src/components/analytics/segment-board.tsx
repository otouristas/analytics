import { ChannelLogo } from "@/components/analytics/channel-logo";
import { CHANNELS } from "@/lib/analytics/channels";
import { useAnalytics } from "@/lib/analytics/store";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { Button } from "@/components/ui/button";

const PRESETS = [
  { label: "Organic search", channel: "google", device: "all" as const },
  { label: "ChatGPT", channel: "chatgpt", device: "all" as const },
  { label: "Grok", channel: "grok", device: "all" as const },
  { label: "Mobile", channel: "all", device: "mobile" as const },
  { label: "Desktop", channel: "all", device: "desktop" as const },
  { label: "Yahoo", channel: "yahoo", device: "all" as const },
  { label: "Facebook", channel: "facebook", device: "all" as const },
];

export function SegmentBoard() {
  const { people, project } = useRealtime();
  const setChannelFilter = useAnalytics((s) => s.setChannelFilter);
  const setDeviceFilter = useAnalytics((s) => s.setDeviceFilter);
  const setView = useAnalytics((s) => s.setView);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <section className="border-b border-border px-5 py-5">
        <p className="kicker">Segments · {project.host}</p>
        <h2 className="mt-1 font-display text-3xl italic tracking-tight text-fg">Reusable cuts of this stream</h2>
        <p className="mt-1 text-sm text-muted">
          Apply a preset. The rest of Meridian (Earth, Live, Pages) respects it until you clear filters.
        </p>
      </section>
      <ul className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-3">
        {PRESETS.map((preset) => (
          <li key={preset.label} className="bg-bg p-5">
            <div className="flex items-center gap-2">
              {preset.channel !== "all" && <ChannelLogo id={preset.channel} size="sm" />}
              <p className="text-sm text-fg">{preset.label}</p>
            </div>
            <p className="mt-1 text-xs text-subtle">
              {preset.channel === "all" ? "any source" : preset.channel} · {preset.device}
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-4"
              onClick={() => {
                setChannelFilter(preset.channel);
                setDeviceFilter(preset.device);
                setView("live");
              }}
            >
              Apply · {people.length} in view
            </Button>
          </li>
        ))}
      </ul>
      <section className="px-5 py-5">
        <h3 className="kicker">All sources</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {CHANNELS.map((channel) => (
            <button
              key={channel.id}
              type="button"
              onClick={() => {
                setChannelFilter(channel.id);
                setView("live");
              }}
              className="inline-flex items-center gap-2 rounded-md bg-elevated px-2 py-1 text-xs text-fg"
            >
              <ChannelLogo id={channel.id} size="sm" />
              {channel.name}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
