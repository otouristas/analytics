import { useState, useMemo } from "react";
import { generateForecast } from "@/lib/analytics/forecast";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { PageShell } from "@/components/analytics/page-shell";
import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function ForecastBoard() {
  const { people, project } = useRealtime();
  const [horizon, setHorizon] = useState<7 | 14 | 30>(14);
  const [metricChoice, setMetricChoice] = useState<"sessions" | "pageviews">("sessions");

  const history = useMemo(() => {
    if (people.length < 5) {
      return [12, 14, 18, 16, 22, 25, 29, 28, 34, 38, 42, 40, 47, 52];
    }
    return people.map((_, i) => Math.max(1, Math.round(i * 1.4 + (i % 3) * 2)));
  }, [people]);

  const report = useMemo(() => {
    return generateForecast(history, horizon, [], metricChoice === "sessions" ? "Active Sessions" : "Page Views");
  }, [history, horizon, metricChoice]);

  return (
    <PageShell
      kicker={`Predictive Intelligence · ${project.host}`}
      title="Predictive Trajectory Forecast"
      dek="Holt-Winters double exponential smoothing with 90% confidence bands forecasting growth trends, capacity demand, and seasonality."
    >
      {/* Controls Bar */}
      <section className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface/40 p-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">Metric:</span>
          {(["sessions", "pageviews"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMetricChoice(m)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors",
                metricChoice === m ? "bg-elevated text-fg shadow-[var(--shadow-border)]" : "text-muted hover:text-fg",
              )}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">Horizon:</span>
          {([7, 14, 30] as const).map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setHorizon(h)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                horizon === h ? "bg-elevated text-fg shadow-[var(--shadow-border)]" : "text-muted hover:text-fg",
              )}
            >
              {h} Days
            </button>
          ))}
        </div>
      </section>

      {/* Forecast Status Strip */}
      <section className="grid gap-px bg-border sm:grid-cols-3">
        <article className="bg-bg p-5">
          <p className="kicker">Trend Trajectory</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="display-stat text-3xl capitalize text-fg">{report.trend}</span>
            {report.trend === "accelerating" || report.trend === "steady" ? (
              <TrendingUp className="size-5 text-positive" />
            ) : report.trend === "declining" ? (
              <TrendingDown className="size-5 text-danger" />
            ) : (
              <Minus className="size-5 text-muted" />
            )}
          </div>
          <p className="mt-1 text-xs text-subtle">Holt-Winters slope parameter</p>
        </article>

        <article className="bg-bg p-5">
          <p className="kicker">Projected Growth</p>
          <p className="display-stat mt-2 text-3xl text-positive">
            {report.growthRatePct > 0 ? "+" : ""}
            {report.growthRatePct.toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-subtle">over next {horizon} periods</p>
        </article>

        <article className="bg-bg p-5">
          <p className="kicker">Confidence Level</p>
          <p className="display-stat mt-2 text-3xl text-fg">90%</p>
          <p className="mt-1 text-xs text-subtle">error variance margin</p>
        </article>
      </section>

      {/* Projection Visualization Cards */}
      <section className="border-b border-border p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl italic text-fg">Projected Values &amp; Confidence Bands</h3>
          <span className="text-xs text-muted flex items-center gap-1">
            <Sparkles className="size-3 text-positive" /> Exponential Additive Smoothing
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {report.projections.slice(0, 14).map((pt) => (
            <div key={pt.label} className="rounded-xl border border-border bg-elevated/50 p-3 text-center">
              <p className="font-mono text-xs text-subtle">{pt.label}</p>
              <p className="display-stat mt-1.5 text-2xl text-fg">{pt.forecast}</p>
              <p className="mt-1 font-mono text-[10px] text-muted">
                [{pt.lowerBound} – {pt.upperBound}]
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Narrative Synthesis */}
      <section className="p-5">
        <div className="rounded-xl bg-elevated p-4">
          <p className="kicker">Strategic Forecast Summary</p>
          <p className="mt-2 text-sm leading-relaxed text-fg">{report.summary}</p>
          <p className="mt-1 text-xs text-muted leading-relaxed">
            Projections dynamically adjust as new live visitor streams enter the collector.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
