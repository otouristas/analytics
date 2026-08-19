import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MobileMetricItem {
  id: string;
  label: string;
  value: string;
  delta: {
    value: string;
    positive: boolean;
  };
  sparkline?: ReactNode;
}

export function MobileMetricCarousel({
  items,
  className,
}: {
  items: MobileMetricItem[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 overflow-x-auto pb-2 pt-1 px-1 scroll-smooth snap-x snap-mandatory thin-scroll -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible",
        className,
      )}
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="min-w-[170px] sm:min-w-0 snap-start flex-1 rounded-xl border border-border bg-surface p-3.5 shadow-xs shrink-0 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="caption font-medium text-muted uppercase tracking-wider">{item.label}</span>
          </div>

          <div className="my-1.5 flex items-baseline justify-between gap-2">
            <span className="text-xl font-semibold tracking-tight text-fg font-sans tabular-nums">{item.value}</span>
            {item.sparkline && <div className="h-5 w-12 shrink-0">{item.sparkline}</div>}
          </div>

          <div className="flex items-center text-xs">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-medium",
                item.delta.positive ? "delta-positive" : "delta-negative",
              )}
            >
              {item.delta.positive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
              <span>{item.delta.value}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
