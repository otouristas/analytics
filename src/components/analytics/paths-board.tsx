import { EXITS, FUNNEL, LANDINGS, RETENTION, SESSIONS } from "@/lib/analytics/sessions";
import { formatPct } from "@/lib/analytics/model";
import { cn } from "@/lib/utils";

export function PathsBoard() {
  const desktop = SESSIONS.filter((session) => session.device === "desktop").length / SESSIONS.length;
  const returning = SESSIONS.filter((session) => session.returning).length / SESSIONS.length;
  const found = SESSIONS.filter((session) => session.found).length / SESSIONS.length;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <section className="grid gap-px bg-border lg:grid-cols-4">
        {FUNNEL.map((step, index) => {
          const prev = FUNNEL[index - 1];
          const drop = prev ? 1 - step.value / prev.value : 0;
          return (
            <article key={step.id} className="bg-bg p-5">
              <p className="text-xs tracking-wide text-muted uppercase">{step.label}</p>
              <p className="mt-2 font-mono text-3xl tabular-nums tracking-tight text-fg">
                {formatPct(step.value)}
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-elevated">
                <div
                  className="h-full rounded-full bg-map-6"
                  style={{ width: `${step.value * 100}%` }}
                />
              </div>
              {prev && (
                <p className="mt-2 text-xs text-subtle">
                  {formatPct(drop)} drop from {prev.label.toLowerCase()}
                </p>
              )}
            </article>
          );
        })}
      </section>

      <section className="grid gap-px border-t border-border bg-border lg:grid-cols-3">
        <article className="bg-bg p-5">
          <h3 className="text-xs tracking-wide text-muted uppercase">Landing pages</h3>
          <p className="mt-1 font-display text-lg text-fg">First touch</p>
          <ul className="mt-4 space-y-2">
            {LANDINGS.map((row) => (
              <li key={row.path} className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate text-fg">{row.title}</span>
                <span className="font-mono text-xs tabular-nums text-muted">
                  {formatPct(row.share)} · {formatPct(row.bounce)} bounce
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="bg-bg p-5">
          <h3 className="text-xs tracking-wide text-muted uppercase">Exit pages</h3>
          <p className="mt-1 font-display text-lg text-fg">Last seen</p>
          <ul className="mt-4 space-y-2">
            {EXITS.map((row) => (
              <li key={row.path} className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate text-fg">{row.title}</span>
                <span className="font-mono text-xs tabular-nums text-muted">{formatPct(row.share)}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="bg-bg p-5">
          <h3 className="text-xs tracking-wide text-muted uppercase">Audiences</h3>
          <p className="mt-1 font-display text-lg text-fg">Who stays</p>
          <StatRow label="Desktop" value={desktop} />
          <StatRow label="Returning" value={returning} />
          <StatRow label="Found intent" value={found} />
          <p className="mt-6 text-xs tracking-wide text-muted uppercase">Weekly retention</p>
          <div className="mt-3 flex items-end gap-1.5">
            {RETENTION.map((value, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={cn("w-full rounded-sm bg-map-5")}
                  style={{ height: `${Math.max(8, value * 96)}px` }}
                />
                <span className="font-mono text-xs text-subtle">W{index}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="mt-3">
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="font-mono tabular-nums text-fg">{formatPct(value)}</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-elevated">
        <div className="h-full rounded-full bg-map-5" style={{ width: `${value * 100}%` }} />
      </div>
    </div>
  );
}
