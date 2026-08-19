import { ExportBar } from "@/components/analytics/export-bar";
import { PageShell } from "@/components/analytics/page-shell";
import { pageMetrics } from "@/lib/analytics/insights";
import { useAnalytics } from "@/lib/analytics/store";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { formatDwellShort, formatPct } from "@/lib/analytics/visitor-name";
import { useMemo } from "react";

function familyOf(path: string) {
  if (/ferry/.test(path)) return "Ferries";
  if (/hotel|villa/.test(path)) return "Stays";
  if (/guide|island/.test(path)) return "Guides";
  if (/flight/.test(path)) return "Flights";
  if (/car|rent/.test(path)) return "Cars";
  if (/touristas|chat|quiz|ai/.test(path)) return "AI";
  if (/blog/.test(path)) return "Journal";
  if (path === "/" || path === "/en" || path === "/el") return "Home";
  return "Site";
}

export function PagesBoard() {
  const { people, project } = useRealtime();
  const setPathFilter = useAnalytics((s) => s.setPathFilter);
  const setView = useAnalytics((s) => s.setView);
  const rows = useMemo(() => pageMetrics(people), [people]);
  const max = rows[0]?.visitors || 1;

  return (
    <PageShell
      kicker={`Pages · ${project.host}`}
      title="What they actually see"
      dek="Visitors, views, bounce, time on route. Tap a row to watch those people live."
      actions={<ExportBar />}
    >
      <div className="grid grid-cols-[2.5rem_1fr_repeat(3,4.5rem)] gap-2 border-b border-border px-4 py-2 text-xs text-subtle sm:grid-cols-[2.5rem_6rem_1fr_repeat(3,4.5rem)]">
        <span>#</span>
        <span className="hidden sm:inline">Family</span>
        <span>Page</span>
        <span className="text-right">Visitors</span>
        <span className="text-right">Bounce</span>
        <span className="text-right">Time</span>
      </div>
      {rows.length === 0 && <p className="px-5 py-10 text-sm text-subtle">No pageviews yet.</p>}
      <ol>
        {rows.map((page, index) => (
          <li key={page.path}>
            <button
              type="button"
              onClick={() => {
                setPathFilter(page.path);
                setView("live");
              }}
              className="grid w-full grid-cols-[2.5rem_1fr_repeat(3,4.5rem)] items-center gap-2 border-b border-border px-4 py-3 text-left hover:bg-surface/70 sm:grid-cols-[2.5rem_6rem_1fr_repeat(3,4.5rem)]"
            >
              <span className="display-stat text-lg text-subtle">{index + 1}</span>
              <span className="hidden kicker sm:inline">{familyOf(page.path)}</span>
              <span className="min-w-0">
                <span className="block truncate text-sm text-fg">{page.title}</span>
                <span className="mt-1 block h-1 overflow-hidden rounded-full bg-elevated">
                  <span className="block h-full bg-map-6" style={{ width: `${Math.max(6, (page.visitors / max) * 100)}%` }} />
                </span>
                <span className="mt-1 block truncate font-mono text-xs text-subtle">{page.path}</span>
              </span>
              <span className="text-right font-mono text-xs tabular-nums text-fg">{page.visitors}</span>
              <span className="text-right font-mono text-xs tabular-nums text-muted">{formatPct(page.bounce)}</span>
              <span className="text-right font-mono text-xs tabular-nums text-muted">{formatDwellShort(page.avgTime)}</span>
            </button>
          </li>
        ))}
      </ol>
    </PageShell>
  );
}
