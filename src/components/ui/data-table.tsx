import { useState, useMemo, type ReactNode } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown, Download, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  id: string;
  header: string;
  accessor: (row: T) => any;
  cell?: (value: any, row: T) => ReactNode;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  width?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKey?: (row: T) => string;
  title?: string;
  actions?: ReactNode;
  pageSize?: number;
  className?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  searchPlaceholder = "Filter rows...",
  searchKey,
  title,
  actions,
  pageSize = 10,
  className,
  onRowClick,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  // Filter
  const filtered = useMemo(() => {
    if (!search || !searchKey) return data;
    const q = search.toLowerCase();
    return data.filter((row) => searchKey(row).toLowerCase().includes(q));
  }, [data, search, searchKey]);

  // Sort
  const sorted = useMemo(() => {
    if (!sortCol) return filtered;
    const col = columns.find((c) => c.id === sortCol);
    if (!col) return filtered;

    return [...filtered].sort((a, b) => {
      const valA = col.accessor(a);
      const valB = col.accessor(b);

      if (typeof valA === "number" && typeof valB === "number") {
        return sortDir === "asc" ? valA - valB : valB - valA;
      }
      return sortDir === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filtered, sortCol, sortDir, columns]);

  // Pagination
  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const handleSort = (colId: string) => {
    if (sortCol === colId) {
      if (sortDir === "desc") setSortDir("asc");
      else {
        setSortCol(null);
        setSortDir("desc");
      }
    } else {
      setSortCol(colId);
      setSortDir("desc");
    }
  };

  return (
    <div className={cn("rounded-xl border border-border bg-surface shadow-xs overflow-hidden", className)}>
      {/* Table Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 border-b border-border bg-surface">
        <div className="flex items-center gap-3">
          {title && <h3 className="text-sm font-semibold text-fg tracking-tight">{title}</h3>}
          <span className="caption text-[11px] rounded-md bg-subtle-surface px-2 py-0.5 font-mono">
            {sorted.length} {sorted.length === 1 ? "row" : "rows"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {searchKey && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={searchPlaceholder}
                className="h-8 w-44 sm:w-60 rounded-lg border border-border bg-elevated/50 pl-8 pr-3 text-xs text-fg placeholder:text-subtle outline-none focus:border-accent"
              />
            </div>
          )}
          {actions}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto thin-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.id}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && handleSort(col.id)}
                  className={cn(
                    col.sortable && "cursor-pointer hover:text-fg transition-colors",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                  )}
                >
                  <div
                    className={cn(
                      "inline-flex items-center gap-1",
                      col.align === "right" && "justify-end w-full",
                      col.align === "center" && "justify-center w-full",
                    )}
                  >
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-subtle">
                        {sortCol === col.id ? (
                          sortDir === "asc" ? (
                            <ChevronUp className="size-3 text-accent" />
                          ) : (
                            <ChevronDown className="size-3 text-accent" />
                          )
                        ) : (
                          <ChevronsUpDown className="size-3 opacity-40" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-xs text-muted">
                  No data matching criteria
                </td>
              </tr>
            ) : (
              paginated.map((row, rIdx) => (
                <tr
                  key={row.id ?? rIdx}
                  onClick={() => onRowClick?.(row)}
                  className={cn(onRowClick && "cursor-pointer hover:bg-subtle-surface")}
                >
                  {columns.map((col) => {
                    const rawVal = col.accessor(row);
                    return (
                      <td
                        key={col.id}
                        className={cn(
                          col.align === "right" && "text-right",
                          col.align === "center" && "text-center",
                        )}
                      >
                        {col.cell ? col.cell(rawVal, row) : rawVal}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-3 border-t border-border bg-surface text-xs text-muted">
          <span>
            Page <strong className="text-fg">{page}</strong> of <strong className="text-fg">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md border border-border px-2.5 py-1 disabled:opacity-40 hover:bg-elevated transition-colors text-fg"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-md border border-border px-2.5 py-1 disabled:opacity-40 hover:bg-elevated transition-colors text-fg"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
