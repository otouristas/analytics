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
      {/* The title owns the full card width. Sharing the row with the status
          badge left ~64px for it at two columns on a phone, which clipped
          "Performance" mid-word — and an unbreakable word cannot wrap out of
          that. The badge moved to the bottom row, where it also reads better
          next to the delta it qualifies. */}
      <span className="block text-xs font-medium leading-tight tracking-tight text-muted">
        {title}
      </span>

      <div className="my-2 flex items-baseline justify-between gap-2">
        <span className="text-xl font-semibold tracking-tight text-fg font-sans tabular-nums">
          {metric}
        </span>
        {sparkline && (
          <div className="h-5 w-14 shrink-0 overflow-hidden opacity-85 transition-opacity group-hover:opacity-100">
            {sparkline}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 text-[11px]">
        <div className="flex min-w-0 items-center gap-2">
          {delta && (
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-0.5 font-medium tabular-nums",
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
          {/* Supplementary only. Below `lg` the bottom row is delta + badge in
              ~185px, which crushed "Confirmed" down to "C." — a fragment that
              reads as a rendering fault. Shown once there is room for it. */}
          {subtitle && <span className="caption hidden truncate lg:inline">{subtitle}</span>}
        </div>
        <StatusBadge status={status} size="sm" className="shrink-0" />
      </div>
    </div>
  );
}
