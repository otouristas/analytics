import { useState } from "react";
import { Calendar, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type DatePreset = "7d" | "28d" | "90d" | "12m" | "mtd" | "ytd";

interface DateRangePickerProps {
  preset?: DatePreset;
  compare?: boolean;
  onPresetChange?: (preset: DatePreset) => void;
  onCompareToggle?: (enabled: boolean) => void;
  className?: string;
}

const PRESETS: { id: DatePreset; label: string }[] = [
  { id: "7d", label: "Last 7 days" },
  { id: "28d", label: "Last 28 days" },
  { id: "90d", label: "Last 90 days" },
  { id: "12m", label: "Last 12 months" },
  { id: "mtd", label: "Month to date" },
  { id: "ytd", label: "Year to date" },
];

export function DateRangePicker({
  preset = "28d",
  compare = true,
  onPresetChange,
  onCompareToggle,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const selectedLabel = PRESETS.find((p) => p.id === preset)?.label ?? "Last 28 days";

  return (
    <div className={cn("relative inline-block", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-fg shadow-xs hover:border-border-strong hover:bg-elevated transition-colors"
      >
        <Calendar className="size-3.5 text-muted" />
        <span>{selectedLabel}</span>
        {compare && <span className="caption text-accent font-normal">vs prev</span>}
        <ChevronDown className="size-3 text-muted" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1.5 z-40 w-56 rounded-xl border border-border bg-surface p-1.5 shadow-lg">
            <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-subtle">
              Date Range
            </div>
            <div className="space-y-0.5">
              {PRESETS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onPresetChange?.(item.id);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs text-fg hover:bg-subtle-surface transition-colors"
                >
                  <span>{item.label}</span>
                  {preset === item.id && <Check className="size-3.5 text-accent" />}
                </button>
              ))}
            </div>

            <div className="mt-1.5 border-t border-border pt-1.5">
              <label className="flex items-center justify-between px-2.5 py-1 text-xs text-fg cursor-pointer rounded-lg hover:bg-subtle-surface">
                <span>Compare previous period</span>
                <input
                  type="checkbox"
                  checked={compare}
                  onChange={(e) => onCompareToggle?.(e.target.checked)}
                  className="size-3.5 rounded border-border accent-accent"
                />
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
