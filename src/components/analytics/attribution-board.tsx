import { useState, useMemo } from "react";
import { computeAttribution, type AttributionModelType } from "@/lib/analytics/attribution-engine";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { PageShell } from "@/components/analytics/page-shell";
import { ChannelLogo } from "@/components/analytics/channel-logo";
import { formatPct } from "@/lib/analytics/visitor-name";
import { cn } from "@/lib/utils";

const MODELS: { id: AttributionModelType; label: string; desc: string }[] = [
  { id: "markov", label: "Markov Chain", desc: "Data-driven algorithmic removal effect credit" },
  { id: "linear", label: "Linear Multi-Touch", desc: "Equal credit across all journey touchpoints" },
  { id: "position_based", label: "Position (40/40/20)", desc: "40% first touch, 40% last touch, 20% middle" },
  { id: "first_touch", label: "First Touch", desc: "100% credit to the discovery channel" },
  { id: "last_touch", label: "Last Touch", desc: "100% credit to the final converting channel" },
];

export function AttributionBoard() {
  const { people, project } = useRealtime();
  const [selectedModel, setSelectedModel] = useState<AttributionModelType>("markov");

  const report = useMemo(() => computeAttribution(people), [people]);

  const activeModelMeta = MODELS.find((m) => m.id === selectedModel)!;

  return (
    <PageShell
      kicker={`Attribution Engine · ${project.host}`}
      title="Multi-Touch Causal Attribution"
      dek="Evaluate the true incremental ROI of modern AI channels (Grok, ChatGPT, Perplexity) vs traditional organic search across multi-step visitor journeys."
    >
      {/* Model Selector Bar */}
      <section className="border-b border-border bg-surface/50 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted mr-2">Attribution Model:</span>
          {MODELS.map((model) => (
            <button
              key={model.id}
              type="button"
              onClick={() => setSelectedModel(model.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                selectedModel === model.id
                  ? "bg-elevated text-fg shadow-[var(--shadow-border)]"
                  : "text-muted hover:text-fg hover:bg-elevated/40",
              )}
            >
              {model.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-subtle">{activeModelMeta.desc}</p>
      </section>

      {/* Summary KPI Strip */}
      <section className="grid gap-px bg-border sm:grid-cols-3">
        <article className="bg-bg p-5">
          <p className="kicker">Conversions Analyzed</p>
          <p className="display-stat mt-2 text-3xl text-fg">{report.totalConversions}</p>
          <p className="mt-1 text-xs text-subtle">sessions with conversion events</p>
        </article>
        <article className="bg-bg p-5">
          <p className="kicker">Total Journeys</p>
          <p className="display-stat mt-2 text-3xl text-fg">{report.totalJourneys}</p>
          <p className="mt-1 text-xs text-subtle">unique multi-touch paths</p>
        </article>
        <article className="bg-bg p-5">
          <p className="kicker">Active Inbound Channels</p>
          <p className="display-stat mt-2 text-3xl text-fg">{report.channels.length}</p>
          <p className="mt-1 text-xs text-subtle">participating in touchpoint sequences</p>
        </article>
      </section>

      {/* Channel Comparison Table */}
      <section className="border-b border-border p-5">
        <h3 className="font-display text-xl italic text-fg">Channel Performance Matrix</h3>
        <p className="mt-1 text-xs text-subtle">
          Comparing credit share under {activeModelMeta.label} vs Last Touch to reveal undervalued discovery channels.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-subtle border-b border-border">
              <tr>
                <th className="py-2.5">Channel</th>
                <th className="py-2.5 text-right">Selected Share</th>
                <th className="py-2.5 text-right">First Touch</th>
                <th className="py-2.5 text-right">Last Touch</th>
                <th className="py-2.5 text-right">Assisted</th>
                <th className="py-2.5 text-right">Efficiency Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {report.channels.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-subtle">
                    Waiting for visitor sessions with touchpoints.
                  </td>
                </tr>
              )}
              {report.channels.map((row) => {
                const activeShare =
                  selectedModel === "markov"
                    ? row.markovShare
                    : selectedModel === "linear"
                      ? row.linearShare
                      : selectedModel === "position_based"
                        ? row.positionShare
                        : selectedModel === "first_touch"
                          ? row.firstTouchShare
                          : row.lastTouchShare;

                return (
                  <tr key={row.channelId} className="hover:bg-surface/30">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <ChannelLogo id={row.channelId} size="sm" />
                        <span className="font-medium text-fg">{row.channelName}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <span className="font-mono text-sm font-semibold text-fg">
                        {formatPct(activeShare)}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono text-xs text-muted">
                      {formatPct(row.firstTouchShare)}
                    </td>
                    <td className="py-3 text-right font-mono text-xs text-muted">
                      {formatPct(row.lastTouchShare)}
                    </td>
                    <td className="py-3 text-right font-mono text-xs text-muted">
                      {row.assistedConversions}
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={cn(
                          "inline-block rounded px-1.5 py-0.5 font-mono text-xs",
                          row.efficiencyIndex > 1.2
                            ? "bg-positive/15 text-positive"
                            : row.efficiencyIndex < 0.8
                              ? "bg-danger/15 text-danger"
                              : "text-muted",
                        )}
                      >
                        {row.efficiencyIndex.toFixed(2)}x
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Attribution Insights Box */}
      <section className="p-5">
        <div className="rounded-xl bg-elevated p-4">
          <p className="kicker">Attribution Intelligence</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Channels with an <span className="text-fg font-medium">Efficiency Index &gt; 1.0x</span> (such as Grok, ChatGPT, or Organic X) act primarily as top-of-funnel discoverers that assist conversions later attributed to direct or branded search. Giving them multi-touch credit prevents under-investing in AI search content.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
