import type { LivePerson } from "@/lib/analytics/realtime";
import { formatPct } from "@/lib/analytics/visitor-name";

export function JourneySankey({ people }: { people: LivePerson[] }) {
  if (people.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-subtle">
        Waiting for visitor journey data.
      </div>
    );
  }

  // Aggregate Step 1 (Landings)
  const step1Map = new Map<string, number>();
  // Aggregate Step 2 (Second Page)
  const step2Map = new Map<string, number>();
  // Aggregate Step 3 (Outcome: Converted, Continued, Bounced)
  let convertedCount = 0;
  let exitCount = 0;
  let exploringCount = 0;

  for (const p of people) {
    const p1 = p.pages[0] || p.path || "/";
    step1Map.set(p1, (step1Map.get(p1) ?? 0) + 1);

    if (p.pages.length > 1) {
      const p2 = p.pages[1]!;
      step2Map.set(p2, (step2Map.get(p2) ?? 0) + 1);
    }

    if (p.converted) {
      convertedCount++;
    } else if (p.pages.length <= 1) {
      exitCount++;
    } else {
      exploringCount++;
    }
  }

  const step1 = [...step1Map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const step2 = [...step2Map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const total = people.length || 1;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {/* Stage 1: Entrance */}
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="kicker">Stage 1: Inbound Entrance</span>
            <span className="font-mono text-xs text-muted">{people.length}</span>
          </div>
          <ul className="mt-3 space-y-2">
            {step1.map(([path, count]) => (
              <li key={path} className="rounded-lg bg-elevated/60 p-2 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="truncate text-fg">{path}</span>
                  <span className="text-muted">{count}</span>
                </div>
                <div className="mt-1 h-1 w-full rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-map-5"
                    style={{ width: `${(count / total) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Stage 2: Navigation & Engagement */}
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="kicker">Stage 2: Exploration Depth</span>
            <span className="font-mono text-xs text-muted">
              {step2.reduce((s, r) => s + r[1], 0)}
            </span>
          </div>
          <ul className="mt-3 space-y-2">
            {step2.length === 0 && (
              <li className="p-4 text-center text-xs text-subtle">
                Single-page sessions only.
              </li>
            )}
            {step2.map(([path, count]) => (
              <li key={path} className="rounded-lg bg-elevated/60 p-2 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="truncate text-fg">{path}</span>
                  <span className="text-muted">{count}</span>
                </div>
                <div className="mt-1 h-1 w-full rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-map-6"
                    style={{ width: `${(count / total) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Stage 3: Conversion & Outbound */}
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="kicker">Stage 3: Session Outcome</span>
            <span className="font-mono text-xs text-muted">{people.length}</span>
          </div>
          <div className="mt-3 space-y-2 text-xs">
            <div className="rounded-lg bg-positive/10 p-2.5 border border-positive/20">
              <div className="flex justify-between font-medium text-positive">
                <span>Goal Completed</span>
                <span className="font-mono">{convertedCount} ({formatPct(convertedCount / total)})</span>
              </div>
            </div>

            <div className="rounded-lg bg-elevated/60 p-2.5">
              <div className="flex justify-between font-medium text-fg">
                <span>Active Browsing</span>
                <span className="font-mono text-muted">{exploringCount} ({formatPct(exploringCount / total)})</span>
              </div>
            </div>

            <div className="rounded-lg bg-danger/10 p-2.5 border border-danger/20">
              <div className="flex justify-between font-medium text-danger">
                <span>Direct Bounce</span>
                <span className="font-mono">{exitCount} ({formatPct(exitCount / total)})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
