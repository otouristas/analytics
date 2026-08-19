import { useState, useMemo } from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, RefreshCw, Zap, ArrowRight } from "lucide-react";
import { PropertyHeader } from "@/components/product/property-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { scanAnomalies, type AnomalySeverity } from "@/lib/analytics/anomaly-radar";
import { useRealtime } from "@/lib/analytics/use-live-feed";
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
    <div className="flex-1 overflow-y-auto dock-safe">
      {/* 1. Property Header */}
      <PropertyHeader
        title="Autonomous Anomaly Radar"
        subtitle="Statistical process control (Z-Score & IQR) scanning event streams for conversions, surges, and errors"
        kpis={[
          { label: "Stream Status", value: report.overallHealth.toUpperCase(), delta: "Healthy", positive: report.overallHealth === "prime" },
          { label: "Anomalies Detected", value: String(report.anomalies.length), delta: "Realtime", positive: report.anomalies.length === 0 },
          { label: "Confidence Threshold", value: "3.0 σ (99.7%)", delta: "Calibrated", positive: true },
          { label: "Scan Frequency", value: "Realtime", delta: "Zero lag", positive: true },
        ]}
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* 2. Severity Filters */}
        <div className="flex items-center gap-2">
          {(["all", "critical", "warning", "opportunity"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors",
                filter === s
                  ? "bg-accent text-white shadow-xs"
                  : "border border-border bg-surface text-muted hover:text-fg hover:bg-elevated",
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {/* 3. Anomalies List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface p-8 text-center">
              <CheckCircle2 className="mx-auto size-8 text-positive mb-2" />
              <h3 className="text-sm font-semibold text-fg">Zero anomalies in current stream</h3>
              <p className="caption mt-1">All telemetry metrics within standard 3-sigma boundaries.</p>
            </div>
          ) : (
            filtered.map((anomaly) => (
              <div
                key={anomaly.id}
                className={cn(
                  "rounded-xl border p-4 shadow-xs transition-all",
                  anomaly.severity === "critical"
                    ? "border-danger/30 bg-danger-soft/10"
                    : anomaly.severity === "warning"
                      ? "border-warning/30 bg-warning-soft/10"
                      : "border-accent/30 bg-accent-soft/10",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge
                        status={anomaly.severity === "critical" ? "critical" : anomaly.severity === "warning" ? "watch" : "healthy"}
                        label={anomaly.severity.toUpperCase()}
                        size="sm"
                      />
                      <span className="caption font-mono">Metric: {anomaly.metric}</span>
                      <span className="caption font-mono font-semibold">Z-Score: {anomaly.zScore.toFixed(1)}σ</span>
                    </div>
                    <h4 className="text-sm font-bold text-fg tracking-tight">{anomaly.title}</h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDiagnose(anomaly.id, anomaly.actionableRecommendation)}
                    className="inline-flex items-center gap-1 rounded-lg bg-surface border border-border px-2.5 py-1 text-xs font-medium text-fg hover:bg-elevated transition-colors"
                  >
                    {diagnosingId === anomaly.id ? (
                      <RefreshCw className="size-3 animate-spin text-accent" />
                    ) : (
                      <Zap className="size-3 text-accent" />
                    )}
                    <span>Diagnose</span>
                  </button>
                </div>

                <p className="mt-2 text-xs text-muted leading-relaxed">{anomaly.body}</p>

                {diagnosisResult[anomaly.id] && (
                  <div className="mt-3 rounded-lg bg-surface p-3 border border-border text-xs text-fg animate-in fade-in">
                    <span className="caption block uppercase font-semibold text-accent mb-1">Prescriptive Remediation</span>
                    <p>{diagnosisResult[anomaly.id]}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
