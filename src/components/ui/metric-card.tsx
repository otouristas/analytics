import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: {
    value: string;
    trend: "up" | "down" | "neutral";
    label?: string;
  };
  sparkline?: ReactNode;
  badge?: ReactNode;
  subtitle?: string;
  className?: string;
  onClick?: () => void;
}

export function MetricCard({
  label,
  value,
  delta,
  sparkline,
  badge,
  subtitle,
  className,
  onClick,
}: MetricCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "metric-card relative flex flex-col justify-between overflow-hidden bg-surface p-4 border border-border rounded-xl transition-all duration-150",
        onClick && "cursor-pointer hover:border-border-strong hover:shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="label font-medium text-muted text-xs tracking-wide">{label}</span>
        {badge}
      </div>

      <div className="my-2.5 flex items-baseline justify-between gap-3">
        <span className="stat-value text-2xl font-semibold tracking-tight text-fg">{value}</span>
        {sparkline && <div className="h-6 w-16 shrink-0">{sparkline}</div>}
      </div>

      <div className="flex items-center justify-between text-xs">
        {delta && (
          <div
            className={cn(
              "flex items-center gap-1 font-medium",
              delta.trend === "up" && "delta-positive",
              delta.trend === "down" && "delta-negative",
              delta.trend === "neutral" && "delta-neutral",
            )}
          >
            {delta.trend === "up" && <ArrowUpRight className="size-3.5" />}
            {delta.trend === "down" && <ArrowDownRight className="size-3.5" />}
            {delta.trend === "neutral" && <Minus className="size-3.5" />}
            <span>{delta.value}</span>
            {delta.label && <span className="text-subtle font-normal ml-0.5">{delta.label}</span>}
          </div>
        )}
        {subtitle && !delta && <span className="caption">{subtitle}</span>}
      </div>
    </div>
  );
}
