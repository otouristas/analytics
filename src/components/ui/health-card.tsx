import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { StatusBadge, type StatusType } from "./status-badge";
import { cn } from "@/lib/utils";

export interface HealthCardProps {
  title: string;
  status: StatusType;
  metric: string;
  delta?: {
    value: string;
    trend: "up" | "down" | "neutral";
  };
  sparkline?: ReactNode;
  subtitle?: string;
  className?: string;
  onClick?: () => void;
}

export function HealthCard({
  title,
  status,
  metric,
  delta,
  sparkline,
  subtitle,
  className,
  onClick,
}: HealthCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex flex-col justify-between rounded-xl border border-border bg-surface p-3.5 transition-all duration-150",
        onClick && "cursor-pointer hover:border-border-strong hover:shadow-xs",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted tracking-tight truncate">{title}</span>
        <StatusBadge status={status} size="sm" />
      </div>

      <div className="my-2 flex items-baseline justify-between gap-2">
        <span className="text-xl font-semibold tracking-tight text-fg font-sans tabular-nums">
          {metric}
        </span>
        {sparkline && <div className="h-5 w-14 shrink-0 opacity-85 group-hover:opacity-100 transition-opacity">{sparkline}</div>}
      </div>

      <div className="flex items-center justify-between text-[11px]">
        {delta && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              delta.trend === "up" && "delta-positive",
              delta.trend === "down" && "delta-negative",
              delta.trend === "neutral" && "delta-neutral",
            )}
          >
            {delta.trend === "up" && <ArrowUpRight className="size-3" />}
            {delta.trend === "down" && <ArrowDownRight className="size-3" />}
            {delta.trend === "neutral" && <Minus className="size-3" />}
            <span>{delta.value}</span>
          </span>
        )}
        {subtitle && <span className="caption truncate ml-auto">{subtitle}</span>}
      </div>
    </div>
  );
}
