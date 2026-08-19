import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAnalytics } from "@/lib/analytics/store";
import { cn } from "@/lib/utils";

export interface DataPoint {
  date: string;
  current: number;
  previous?: number;
  annotation?: string;
}

export interface TrendChartProps {
  data: DataPoint[];
  title?: string;
  metricLabel?: string;
  metricValue?: string;
  delta?: string;
  type?: "area" | "line" | "bar";
  height?: number;
  showCompare?: boolean;
  className?: string;
  metrics?: { id: string; label: string }[];
  activeMetric?: string;
  onMetricChange?: (id: string) => void;
  granularity?: "day" | "week" | "month";
  onGranularityChange?: (g: "day" | "week" | "month") => void;
}

export function TrendChart({
  data,
  title = "Business Performance",
  metricLabel,
  metricValue,
  delta,
  type = "area",
  height = 280,
  showCompare = true,
  className,
  metrics,
  activeMetric,
  onMetricChange,
  granularity = "day",
  onGranularityChange,
}: TrendChartProps) {
  const theme = useAnalytics((s) => s.theme);
  const isDark = theme === "dark";

  const primaryColor = isDark ? "#5268FF" : "#4A5AE8";
  const compareColor = isDark ? "#8B8D94" : "#9B9DA3";
  const gridColor = isDark ? "#1E2228" : "#E5E7EB";
  const textColor = isDark ? "#8B8D94" : "#64666D";

  return (
    <div className={cn("rounded-xl border border-border bg-surface p-4 sm:p-5 shadow-xs", className)}>
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-semibold text-fg tracking-tight">{title}</h3>
            {delta && (
              <span className="rounded-full bg-positive-soft px-2 py-0.5 text-[11px] font-medium text-positive">
                {delta}
              </span>
            )}
          </div>
          {(metricLabel || metricValue) && (
            <div className="mt-1 flex items-baseline gap-2">
              {metricValue && <span className="stat-value text-xl font-bold text-fg">{metricValue}</span>}
              {metricLabel && <span className="caption">{metricLabel}</span>}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Metric Selector Dropdown/Tabs if passed */}
          {metrics && onMetricChange && (
            <div className="flex items-center rounded-lg border border-border bg-subtle-surface p-0.5 text-xs">
              {metrics.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onMetricChange(m.id)}
                  className={cn(
                    "rounded-md px-2.5 py-1 font-medium transition-colors",
                    activeMetric === m.id ? "bg-surface text-fg shadow-xs" : "text-muted hover:text-fg",
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}

          {/* Granularity switch */}
          {onGranularityChange && (
            <div className="hidden sm:flex items-center rounded-lg border border-border bg-subtle-surface p-0.5 text-xs">
              {(["day", "week", "month"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => onGranularityChange(g)}
                  className={cn(
                    "capitalize rounded-md px-2 py-1 font-medium transition-colors",
                    granularity === g ? "bg-surface text-fg shadow-xs" : "text-muted hover:text-fg",
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chart Area */}
      <div style={{ height, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          {type === "bar" ? (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="date" stroke={textColor} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke={textColor} fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              {showCompare && <Bar dataKey="previous" fill={compareColor} opacity={0.35} radius={[3, 3, 0, 0]} />}
              <Bar dataKey="current" fill={primaryColor} radius={[3, 3, 0, 0]} />
            </BarChart>
          ) : type === "line" ? (
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="date" stroke={textColor} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke={textColor} fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              {showCompare && (
                <Line
                  type="monotone"
                  dataKey="previous"
                  stroke={compareColor}
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              )}
              <Line type="monotone" dataKey="current" stroke={primaryColor} strokeWidth={2} dot={false} />
            </LineChart>
          ) : (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="meridianGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="date" stroke={textColor} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke={textColor} fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              {showCompare && (
                <Area
                  type="monotone"
                  dataKey="previous"
                  stroke={compareColor}
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  fill="transparent"
                />
              )}
              <Area
                type="monotone"
                dataKey="current"
                stroke={primaryColor}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#meridianGradient)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend / Annotations */}
      <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-muted pt-2 border-t border-border/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-accent" />
            <span>Current period</span>
          </div>
          {showCompare && (
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-muted opacity-50" />
              <span>Previous period</span>
            </div>
          )}
        </div>

        <span className="caption">Annotations active (4 updates)</span>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-lg border border-border bg-surface/95 backdrop-blur-md p-2.5 shadow-md text-xs">
      <p className="font-medium text-fg mb-1">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center justify-between gap-3 py-0.5">
          <span className="text-muted flex items-center gap-1.5">
            <span className="size-1.5 rounded-full" style={{ backgroundColor: entry.color ?? entry.fill }} />
            {entry.dataKey === "current" ? "Current" : "Previous"}:
          </span>
          <span className="font-semibold text-fg tabular-nums">{Number(entry.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}
