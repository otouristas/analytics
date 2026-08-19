import { deviceBreak, vitals } from "@/lib/analytics/insights";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { useMemo } from "react";

export function DeviceBoard() {
  const { events, project } = useRealtime();
  const broke = useMemo(() => deviceBreak(events), [events]);
  const vit = useMemo(() => vitals(events), [events]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <section className="border-b border-border px-5 py-5">
        <p className="kicker">Performance · {project.host}</p>
        <h2 className="mt-1 font-display text-3xl italic tracking-tight text-fg">Device and vitals</h2>
        <p className="mt-1 text-sm text-muted">
          Web Vitals appear once the site script sends LCP/INP/CLS. Until then you still get device mix.
        </p>
      </section>
      <section className="grid gap-px bg-border lg:grid-cols-3">
        <Col title="Device" rows={broke.device} />
        <Col title="OS" rows={broke.os} />
        <Col title="Browser" rows={broke.browser} />
      </section>
      <section className="border-t border-border px-5 py-5">
        <h3 className="kicker">Web Vitals</h3>
        {vit.length === 0 ? (
          <p className="mt-3 text-sm text-subtle">No vital samples in this stream yet.</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-6">
            {vit.map((row) => (
              <li key={row.name}>
                <p className="kicker">{row.name}</p>
                <p className="display-stat mt-1 text-3xl text-fg">{row.avg}</p>
                <p className="text-xs text-subtle">{row.samples} samples</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Col({ title, rows }: { title: string; rows: { label: string; value: number }[] }) {
  return (
    <article className="bg-bg p-5">
      <h3 className="kicker">{title}</h3>
      <ul className="mt-3 space-y-2">
        {rows.map((row) => (
          <li key={row.label} className="flex justify-between text-sm">
            <span className="text-fg">{row.label || "unknown"}</span>
            <span className="font-mono text-xs tabular-nums text-muted">{row.value}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
