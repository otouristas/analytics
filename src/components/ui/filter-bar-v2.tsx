import { useState } from "react";
import { Filter, X, ChevronDown, Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActiveFilter {
  category: string;
  value: string;
  label: string;
}

export function FilterBarV2({
  activeFilters = [],
  onRemoveFilter,
  onClearAll,
  className,
}: {
  activeFilters?: ActiveFilter[];
  onRemoveFilter?: (filter: ActiveFilter) => void;
  onClearAll?: () => void;
  className?: string;
}) {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const categories = [
    { id: "country", label: "Country", options: ["United Kingdom", "Germany", "France", "United States", "Greece"] },
    { id: "channel", label: "Channel", options: ["Organic Search", "Direct", "AI Discovery", "Paid Search", "Social"] },
    { id: "device", label: "Device", options: ["Mobile", "Desktop", "Tablet"] },
    { id: "page", label: "Landing Page", options: ["/santorini-hotels", "/paros-guide", "/sifnos/hotels", "/naxos-car-rental"] },
  ];

  return (
    <div className={cn("flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-border bg-surface text-xs", className)}>
      <div className="flex items-center gap-1.5 text-muted font-medium mr-1">
        <Filter className="size-3.5" />
        <span>Filters</span>
      </div>

      {/* Filter Dropdown buttons */}
      {categories.map((cat) => (
        <div key={cat.id} className="relative">
          <button
            type="button"
            onClick={() => setOpenCategory(openCategory === cat.id ? null : cat.id)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-elevated/50 px-2.5 py-1 text-fg hover:bg-elevated transition-colors"
          >
            <span>{cat.label}</span>
            <ChevronDown className="size-3 text-muted" />
          </button>

          {openCategory === cat.id && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setOpenCategory(null)} />
              <div className="absolute left-0 top-full mt-1 z-30 w-44 rounded-xl border border-border bg-surface p-1 shadow-lg">
                {cat.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setOpenCategory(null);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs text-fg hover:bg-subtle-surface"
                  >
                    <span>{opt}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      ))}

      {/* Active Filter Pills */}
      {activeFilters.map((f, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent-soft px-2.5 py-0.5 text-accent font-medium text-xs"
        >
          <span>{f.category}: <strong>{f.label}</strong></span>
          <button
            type="button"
            onClick={() => onRemoveFilter?.(f)}
            className="rounded-full p-0.5 hover:bg-accent/20 transition-colors"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}

      {activeFilters.length > 0 && onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-subtle hover:text-fg text-xs font-medium ml-auto flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="size-3" />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
}
