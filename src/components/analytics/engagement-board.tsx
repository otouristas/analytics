import { formsAndScroll } from "@/lib/analytics/insights";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { useMemo } from "react";

export function EngagementBoard() {
  const { events, project } = useRealtime();
  const data = useMemo(() => formsAndScroll(events), [events]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <section className="border-b border-border px-5 py-5">
        <p className="kicker">Engagement · {project.host}</p>
        <h2 className="mt-1 font-display text-3xl italic tracking-tight text-fg">Scroll, forms, files</h2>
        <p className="mt-1 text-sm text-muted">
          Only what the script sent. Form field values are never captured.
        </p>
      </section>
      <section className="grid gap-px bg-border sm:grid-cols-3">
        <article className="bg-bg px-5 py-5">
          <p className="kicker">Forms</p>
          <p className="display-stat mt-2 text-4xl text-fg">{data.forms}</p>
        </article>
        <article className="bg-bg px-5 py-5">
          <p className="kicker">Downloads</p>
          <p className="display-stat mt-2 text-4xl text-fg">{data.downloads}</p>
        </article>
        <article className="bg-bg px-5 py-5">
          <p className="kicker">Scroll 75%+</p>
          <p className="display-stat mt-2 text-4xl text-fg">
            {data.depths.find((row) => row.mark === 75)?.value ?? 0}
          </p>
        </article>
      </section>
      <section className="px-5 py-5">
        <h3 className="kicker">Depth</h3>
        <ul className="mt-3 space-y-2">
          {data.depths.map((row) => (
            <li key={row.mark} className="flex items-center gap-3 text-sm">
              <span className="w-10 font-mono text-xs text-muted">{row.mark}%</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-elevated">
                <span
                  className="block h-full bg-map-5"
                  style={{ width: `${Math.min(100, row.value * 8)}%` }}
                />
              </span>
              <span className="font-mono text-xs tabular-nums">{row.value}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
