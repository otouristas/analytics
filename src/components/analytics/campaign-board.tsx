import { campaigns } from "@/lib/analytics/insights";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { useMemo, useState } from "react";

export function CampaignBoard() {
  const { events, project } = useRealtime();
  const rows = useMemo(() => campaigns(events), [events]);
  const [url, setUrl] = useState("https://discovercyclades.gr/en");
  const [source, setSource] = useState("google");
  const [medium, setMedium] = useState("organic");
  const [campaign, setCampaign] = useState("cyclades-spring");
  const built = useMemo(() => {
    try {
      const next = new URL(url);
      next.searchParams.set("utm_source", source);
      next.searchParams.set("utm_medium", medium);
      next.searchParams.set("utm_campaign", campaign);
      return next.toString();
    } catch {
      return "";
    }
  }, [url, source, medium, campaign]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <section className="border-b border-border px-5 py-5">
        <p className="kicker">Campaigns · {project.host}</p>
        <h2 className="mt-1 font-display text-3xl italic tracking-tight text-fg">UTM builder</h2>
      </section>
      <section className="grid gap-3 border-b border-border p-5 sm:grid-cols-2">
        <Field label="URL" value={url} onChange={setUrl} />
        <Field label="Source" value={source} onChange={setSource} />
        <Field label="Medium" value={medium} onChange={setMedium} />
        <Field label="Campaign" value={campaign} onChange={setCampaign} />
        <p className="sm:col-span-2 break-all rounded-md bg-elevated p-3 font-mono text-xs text-fg">{built}</p>
      </section>
      <section className="px-5 py-5">
        <h3 className="kicker">Terms in this stream</h3>
        <ul className="mt-3 space-y-2">
          {rows.length === 0 && <li className="text-sm text-subtle">No query or campaign terms yet.</li>}
          {rows.map((row) => (
            <li key={row.label} className="flex justify-between text-sm">
              <span className="truncate text-fg">{row.label}</span>
              <span className="font-mono text-xs tabular-nums">{row.value}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="text-xs text-muted">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-10 w-full rounded-md bg-elevated px-3 text-sm text-fg outline-none"
      />
    </label>
  );
}
