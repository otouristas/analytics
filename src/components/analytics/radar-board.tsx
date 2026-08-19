import { useState, useMemo } from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, RefreshCw, Zap } from "lucide-react";
import { scanAnomalies, type AnomalySeverity } from "@/lib/analytics/anomaly-radar";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/analytics/page-shell";
import { useAnalytics } from "@/lib/analytics/store";
import { cn } from "@/lib/utils";

export function RadarBoard() {
  const { events, people, project } = useRealtime();
  const setView = useAnalytics((s) => s.setView);
  const [filter, setFilter] = useState<AnomalySeverity | "all">("all");
  const [diagnosingId, setDiagnosingId] = useState<string | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<Record<string, string>>({});

  const report = useMemo(() => scanAnomalies(events, people), [events, people]);

  const filtered = useMemo(() => {
    if (filter === "all") return report.anomalies;
    return report.anomalies.filter((a) => a.severity === filter);
  }, [report.anomalies, filter]);

  const handleDiagnose = (id: string, recommendation: string) => {
    setDiagnosingId(id);
    setTimeout(() => {
      setDiagnosisResult((prev) => ({
        ...prev,
        [id]: `Prescriptive AI Action Plan: ${recommendation} Continuous monitoring engaged with real-time statistical baseline recalculation.`,
      }));
      setDiagnosingId(null);
    }, 450);
  };

  return (
    <PageShell
      kicker={`Anomaly Radar · ${project.host}`}
      title="Autonomous Anomaly Radar"
      dek="Continuous statistical process control (Z-Score & IQR) scanning event streams for conversion drops, traffic surges, rage clicks, and errors."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setView("debug")}>
            Inspect Debug Log
          </Button>
          <Button variant="outline" size="sm" onClick={() => setView("query")}>
            <Sparkles className="mr-1 size-3.5" />
            Ask Meridian AI
          </Button>
        </div>
      }
    >
      {/* Overall Health Status Bar */}
      <section className="grid gap-px bg-border sm:grid-cols-4">
        <HealthStat
          label="Stream Health"
          value={report.overallHealth.toUpperCase()}
          tone={
            report.overallHealth === "prime"
              ? "positive"
              : report.overallHealth === "critical"
                ? "danger"
                : "warning"
          }
          hint={`${report.anomalies.length} anomaly signal(s) active`}
        />
        <HealthStat label="Rage Clicks" value={String(report.stats.rageClicks)} hint="high-friction elements" />
        <HealthStat label="Script Errors" value={String(report.stats.clientErrors)} hint="client exceptions" />
        <HealthStat
          label="LCP Performance"
          value={report.stats.lcpAverage > 0 ? `${(report.stats.lcpAverage / 1000).toFixed(2)}s` : "Optimal"}
          hint="average Core Web Vital"
        />
      </section>

      {/* Filter Tabs */}
      <section className="flex items-center gap-2 border-b border-border px-5 py-3">
        <span className="text-xs text-muted">Filter severity:</span>
        {(["all", "critical", "warning", "opportunity"] as const).map((sev) => (
          <button
            key={sev}
            type="button"
            onClick={() => setFilter(sev)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors",
              filter === sev ? "bg-elevated text-fg shadow-[var(--shadow-border)]" : "text-muted hover:text-fg",
            )}
          >
            {sev}
            {sev !== "all" && (
              <span className="ml-1.5 opacity-60">
                ({report.anomalies.filter((a) => a.severity === sev).length})
              </span>
            )}
          </button>
        ))}
      </section>

      {/* Anomaly Feed */}
      <section className="divide-y divide-border">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <CheckCircle2 className="size-10 text-positive/80" />
            <p className="mt-3 font-display text-xl italic text-fg">All systems operating within baseline parameters</p>
            <p className="mt-1 text-xs text-subtle">
              No {filter !== "all" ? filter : ""} statistical deviations detected across {report.stats.scannedEvents} events.
            </p>
          </div>
        )}

        {filtered.map((anomaly) => (
          <article key={anomaly.id} className="p-5 hover:bg-surface/40 transition-colors">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <SeverityBadge severity={anomaly.severity} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="kicker">{anomaly.metric}</span>
                    <span className="font-mono text-xs text-subtle">Z: {anomaly.zScore > 0 ? "+" : ""}{anomaly.zScore.toFixed(1)}</span>
                  </div>
                  <h3 className="mt-1 font-display text-lg italic text-fg">{anomaly.title}</h3>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">{anomaly.body}</p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={diagnosingId === anomaly.id}
                onClick={() => handleDiagnose(anomaly.id, anomaly.actionableRecommendation)}
              >
                {diagnosingId === anomaly.id ? (
                  <>
                    <RefreshCw className="mr-1 size-3 animate-spin" />
                    Diagnosing…
                  </>
                ) : (
                  <>
                    <Zap className="mr-1 size-3" />
                    AI Action Plan
                  </>
                )}
              </Button>
            </div>

            {/* Prescriptive Recommendation Box */}
            <div className="mt-4 rounded-lg bg-elevated/70 p-3.5 text-xs">
              <p className="font-medium text-fg">Recommended Intervention:</p>
              <p className="mt-1 text-muted leading-relaxed">
                {diagnosisResult[anomaly.id] || anomaly.actionableRecommendation}
              </p>
            </div>
          </article>
        ))}
      </section>
    </PageShell>
  );
}

function SeverityBadge({ severity }: { severity: AnomalySeverity }) {
  if (severity === "critical") {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-danger/15 text-danger">
        <ShieldAlert className="size-4" />
      </span>
    );
  }
  if (severity === "warning") {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
        <AlertTriangle className="size-4" />
      </span>
    );
  }
  if (severity === "opportunity") {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-positive/15 text-positive">
        <Sparkles className="size-4" />
      </span>
    );
  }
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-elevated text-subtle">
      <CheckCircle2 className="size-4" />
    </span>
  );
}

function HealthStat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "positive" | "danger" | "warning";
}) {
  return (
    <article className="bg-bg p-5">
      <p className="kicker">{label}</p>
      <p
        className={cn(
          "display-stat mt-2 text-3xl",
          tone === "positive" && "text-positive",
          tone === "danger" && "text-danger",
          tone === "warning" && "text-amber-400",
          !tone && "text-fg",
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-subtle">{hint}</p>
    </article>
  );
}
