import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { ChannelLogo } from "@/components/analytics/channel-logo";
import { Sparkline } from "@/components/analytics/sparkline";
import { PropertyHeader } from "@/components/product/property-header";
import { EmptyState } from "@/components/ui/empty-state";
import { CHANNEL_BY_ID, CHANNELS, FAMILIES, type ChannelFamily } from "@/lib/analytics/channels";
import { sourceMetrics } from "@/lib/analytics/insights";
import { useAnalytics } from "@/lib/analytics/store";
import { formatPct } from "@/lib/analytics/visitor-name";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { cn } from "@/lib/utils";

interface ChannelRow {
  id: string;
  name: string;
  family: ChannelFamily;
  sessions: number;
  converted: number;
  /** Share of all sessions, 0–1. */
  share: number;
  /** Goal completion rate for this channel, 0–1. */
  rate: number;
  /** Real arrival counts over the window, for the inline trend. */
  series: number[];
}

/** How many buckets the inline channel sparkline is drawn from. */
const TREND_BUCKETS = 10;

/**
 * Arrivals per time bucket for one channel, from real session timestamps.
 *
 * Built from `lastTs` rather than a synthetic series: a sparkline that does not
 * come from the data is a decoration pretending to be evidence. Returns a flat
 * array of zeroes when the channel has no sessions, which draws nothing.
 */
function channelSeries(
  people: { source: string; lastTs: number }[],
  channelId: string,
): number[] {
  const mine = people.filter((p) => (p.source || "direct") === channelId);
  if (mine.length === 0) return [];

  const stamps = mine.map((p) => p.lastTs);
  const min = Math.min(...stamps);
  const max = Math.max(...stamps);
  const span = max - min;
  const buckets = new Array<number>(TREND_BUCKETS).fill(0);

  // All sessions inside one instant: put them in the last bucket rather than
  // dividing by a zero span.
  if (span <= 0) {
    buckets[TREND_BUCKETS - 1] = mine.length;
    return buckets;
  }

  for (const ts of stamps) {
    const i = Math.min(TREND_BUCKETS - 1, Math.floor(((ts - min) / span) * TREND_BUCKETS));
    buckets[i] += 1;
  }
  return buckets;
}

/**
 * Acquisition: which channels bring traffic, and which of them bring traffic
 * that does anything.
 *
 * The cards answer "how big"; the table answers "how good". Both are needed —
 * a channel can be the largest source of sessions and the smallest source of
 * conversions at the same time, which is the whole point of the board.
 */
export function SourceBoard() {
  const sourceId = useAnalytics((s) => s.sourceId);
  const setSourceId = useAnalytics((s) => s.setSourceId);
  const setView = useAnalytics((s) => s.setView);
  const [family, setFamily] = useState<ChannelFamily | "all">("all");
  const { people, sources, project } = useRealtime();

  const rates = useMemo(
    () => new Map(sourceMetrics(people).map((row) => [row.id, row])),
    [people],
  );
  const total = people.length || 1;

  // Live projects show only channels actually present in the stream; the demo
  // workspace shows the full catalogue so the board is never blank.
  const all: ChannelRow[] = useMemo(() => {
    const build = (id: string, sessions: number): ChannelRow => {
      const meta = CHANNEL_BY_ID[id];
      const metric = rates.get(id);
      return {
        id,
        name: meta?.name ?? id,
        family: meta?.family ?? "referral",
        sessions,
        converted: metric?.converted ?? 0,
        share: sessions / total,
        rate: metric?.rate ?? 0,
        series: channelSeries(people, id),
      };
    };

    return project.live
      ? sources.map(([id, count]) => build(id, count))
      : CHANNELS.map((c) => build(c.id, 0));
  }, [project.live, sources, rates, total, people]);

  const visible = useMemo(
    () => all.filter((row) => family === "all" || row.family === family),
    [all, family],
  );

  const totals = useMemo(() => {
    const sessions = all.reduce((n, r) => n + r.sessions, 0);
    const converted = all.reduce((n, r) => n + r.converted, 0);
    // Qualified is a property of a SESSION, not of its channel. Summing the
    // sessions of every channel that had at least one conversion counted almost
    // everything as qualified (97.7%), which is plainly wrong.
    const qualified = people.filter((p) => p.qualified).length;
    return { sessions, converted, qualified, channels: all.filter((r) => r.sessions > 0).length };
  }, [all, people]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto dock-safe">
      <PropertyHeader
        eyebrow="Where visitors come from"
        title="Acquisition"
        subtitle="Every channel bringing traffic, ranked by the traffic that actually converts."
        kpis={[
          {
            label: "Sessions",
            value: totals.sessions.toLocaleString(),
            delta: `${totals.channels} channels`,
          },
          {
            label: "Qualified Sessions",
            value: totals.qualified.toLocaleString(),
            delta: formatPct(totals.qualified / (totals.sessions || 1)),
            positive: true,
          },
          {
            label: "Conversions",
            value: totals.converted.toLocaleString(),
            delta: formatPct(totals.converted / (totals.sessions || 1)),
            positive: true,
          },
          {
            label: "Top Channel",
            value: all[0]?.name ?? "—",
            delta: all[0] ? `${Math.round(all[0].share * 100)}% of sessions` : undefined,
          },
        ]}
      />

      {/* Channel family filter */}
      <div className="scrollbar-none flex items-center gap-1 overflow-x-auto border-b border-hairline px-4 py-2.5 sm:px-6">
        <FamilyChip active={family === "all"} onClick={() => setFamily("all")}>
          All channels
        </FamilyChip>
        {FAMILIES.map((item) => (
          <FamilyChip
            key={item.id}
            active={family === item.id}
            onClick={() => setFamily(item.id)}
          >
            {item.label}
          </FamilyChip>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          className="m-6"
          title="No channels in this stream yet"
          description="Once sessions arrive, the channels that referred them appear here."
        />
      ) : (
        <div className="space-y-6 p-4 sm:p-6">
          {/* Channel cards — the "how big" view */}
          <section>
            <h2 className="heading-md mb-3">Channels</h2>
            <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
              {visible.map((channel) => {
                const active = sourceId === channel.id;
                return (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => {
                      setSourceId(active ? null : channel.id);
                      setView("live");
                    }}
                    className={cn(
                      "rounded-xl border bg-surface p-4 text-left transition-colors",
                      active
                        ? "border-accent"
                        : "border-hairline hover:border-brand/35",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <ChannelLogo id={channel.id} size="lg" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-fg">{channel.name}</p>
                        <p className="caption capitalize">{channel.family}</p>
                      </div>
                    </div>
                    <p className="stat-value mt-4 text-2xl">{channel.sessions.toLocaleString()}</p>
                    <p className="caption mt-0.5">
                      {Math.round(channel.share * 100)}% of sessions
                      {channel.rate > 0 && ` · ${formatPct(channel.rate)} goals`}
                    </p>
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-subtle-surface">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${Math.max(4, channel.share * 100)}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* The table — the "how good" view */}
          <section>
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 className="heading-md">Channel performance</h2>
              <span className="caption">Sorted by sessions</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-hairline">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Channel</th>
                    <th className="text-right">Sessions</th>
                    <th className="text-right">Share</th>
                    <th className="text-right">Conversions</th>
                    <th className="text-right">Goal rate</th>
                    <th className="text-right">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {[...visible]
                    .sort((a, b) => b.sessions - a.sessions)
                    .map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => {
                          setSourceId(row.id);
                          setView("live");
                        }}
                        className="cursor-pointer"
                      >
                        <td>
                          <span className="flex items-center gap-2.5">
                            <ChannelLogo id={row.id} size="sm" />
                            <span className="font-medium text-fg">{row.name}</span>
                            <span className="caption capitalize">{row.family}</span>
                          </span>
                        </td>
                        <td className="text-right font-medium">
                          {row.sessions.toLocaleString()}
                        </td>
                        <td className="text-right text-muted">
                          {Math.round(row.share * 100)}%
                        </td>
                        <td className="text-right text-muted">{row.converted}</td>
                        <td className="text-right">
                          <span className={row.rate > 0 ? "delta-positive" : "text-subtle"}>
                            {row.rate > 0 ? formatPct(row.rate) : "—"}
                          </span>
                        </td>
                        <td className="w-24 text-right">
                          {row.series.length > 0 ? (
                            <span className="ml-auto block h-5 w-20 overflow-hidden">
                              <Sparkline values={row.series} />
                            </span>
                          ) : (
                            <span className="text-subtle">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <p className="caption mt-3 inline-flex items-center gap-1">
              <ArrowUpRight className="size-3" />
              Click any channel to inspect its live sessions.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}

function FamilyChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 shrink-0 rounded-full px-3 text-xs font-medium transition-colors",
        active
          ? "bg-accent text-accent-fg"
          : "text-muted hover:bg-subtle-surface hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}
