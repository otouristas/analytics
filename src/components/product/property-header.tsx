import type { ReactNode } from "react";
import { ArrowUpRight, ExternalLink, Settings, Share2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAnalytics } from "@/lib/analytics/store";
import { PROJECT_BY_ID } from "@/lib/analytics/projects";
import { cn } from "@/lib/utils";

export interface PropertyHeaderProps {
  title?: string;
  subtitle?: string;
  badges?: ReactNode;
  actions?: ReactNode;
  kpis?: {
    label: string;
    value: string;
    delta?: string;
    positive?: boolean;
  }[];
  className?: string;
}

export function PropertyHeader({
  title,
  subtitle,
  badges,
  actions,
  kpis,
  className,
}: PropertyHeaderProps) {
  const projectId = useAnalytics((s) => s.projectId);
  const project = PROJECT_BY_ID[projectId];

  const defaultKPIs = [
    { label: "Sessions", value: "128,429", delta: "+14.3%", positive: true },
    { label: "Qualified Sessions", value: "32,841", delta: "+21.8%", positive: true },
    { label: "Conversions", value: "2,184", delta: "+8.2%", positive: true },
    { label: "Revenue", value: "€84,920", delta: "+11.3%", positive: true },
  ];

  const displayKPIs = kpis ?? defaultKPIs;

  return (
    <div className={cn("border-b border-border bg-surface px-4 py-5 sm:px-6", className)}>
      {/* Top row: Property identity & badges */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-fg truncate">
              {title ?? project.name}
            </h1>
            <a
              href={`https://${project.host}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono text-xs text-accent hover:underline"
            >
              <span>{project.host}</span>
              <ExternalLink className="size-3" />
            </a>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status="live" label="Live Tracking" size="sm" />
            <StatusBadge status="connected" label="Search Console Connected" size="sm" />
            <StatusBadge status="healthy" label="Analytics Healthy" size="sm" />
            {badges}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {actions}
        </div>
      </div>

      {/* Primary KPI row */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border/60">
        {displayKPIs.map((kpi, idx) => (
          <div key={idx} className="rounded-xl border border-border/70 bg-elevated/40 p-3">
            <span className="caption block uppercase tracking-wider">{kpi.label}</span>
            <div className="mt-1 flex items-baseline justify-between gap-2">
              <span className="stat-value text-lg font-bold text-fg">{kpi.value}</span>
              {kpi.delta && (
                <span
                  className={cn(
                    "text-xs font-semibold flex items-center gap-0.5",
                    kpi.positive ? "delta-positive" : "delta-negative",
                  )}
                >
                  <ArrowUpRight className="size-3" />
                  {kpi.delta}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
