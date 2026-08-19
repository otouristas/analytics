import { ChannelLogo } from "@/components/analytics/channel-logo";
import { CHANNEL_BY_ID } from "@/lib/analytics/channels";
import { isConversionEvent } from "@/lib/analytics/ingest";
import { rootCause } from "@/lib/analytics/insights";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { useMemo } from "react";

export function CauseBoard() {
  const { people, project } = useRealtime();
  const data = useMemo(() => rootCause(people), [people]);
  const conversions = people.filter((person) => person.events.some(isConversionEvent)).length;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <section className="border-b border-border px-5 py-5">
        <p className="kicker">Root cause · {project.host}</p>
        <h2 className="mt-1 font-display text-3xl italic tracking-tight text-fg">What moved, in this stream</h2>
        <p className="mt-1 max-w-xl text-sm text-muted">
          {people.length} sessions · {conversions} conversions. Decomposition is share of sessions vs share of conversions — not invented euros.
        </p>
      </section>
      <section className="grid gap-px bg-border lg:grid-cols-2">
        <Dim
          title="Source"
          rows={data.source.slice(0, 8).map((row) => ({
            ...row,
            label: CHANNEL_BY_ID[row.id]?.name ?? row.id,
            logo: row.id,
          }))}
        />
        <Dim title="Country" rows={data.country.slice(0, 8).map((row) => ({ ...row, label: row.id }))} />
        <Dim title="Device" rows={data.device.map((row) => ({ ...row, label: row.id }))} />
        <Dim title="Page" rows={data.page.slice(0, 8).map((row) => ({ ...row, label: row.id }))} />
      </section>
    </div>
  );
}

function Dim({
  title,
  rows,
}: {
  title: string;
  rows: { id: string; label: string; sessions: number; conversions: number; rate: number; logo?: string }[];
}) {
  return (
    <article className="bg-bg p-5">
      <h3 className="kicker">{title}</h3>
      <ul className="mt-4 space-y-3">
        {rows.length === 0 && <li className="text-sm text-subtle">Need more sessions.</li>}
        {rows.map((row) => (
          <li key={row.id} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              {row.logo && <ChannelLogo id={row.logo} size="sm" />}
              <span className="truncate text-fg">{row.label}</span>
            </span>
            <span className="shrink-0 font-mono text-xs tabular-nums text-muted">
              {row.sessions} · {Math.round(row.rate * 1000) / 10}%
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}
