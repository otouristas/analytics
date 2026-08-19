import { ChannelLogo } from "@/components/analytics/channel-logo";
import { searchTerms } from "@/lib/analytics/insights";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { useMemo } from "react";

export function SeoBoard() {
  const { events, pages, project, people } = useRealtime();
  const terms = useMemo(() => searchTerms(events), [events]);
  const organic = people.filter((person) =>
    ["google", "bing", "yahoo", "duckduckgo", "yandex", "baidu", "apple"].includes(person.source),
  );

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <section className="border-b border-border px-5 py-5">
        <p className="kicker">SEO · {project.host}</p>
        <h2 className="mt-1 font-display text-3xl italic tracking-tight text-fg">Queries we actually saw</h2>
        <p className="mt-1 max-w-xl text-sm text-muted">
          {organic.length} organic sessions in this stream. No Search Console yet — these are on-site q= and utm_term hits.
        </p>
      </section>
      <section className="grid gap-px bg-border lg:grid-cols-2">
        <article className="bg-bg p-5">
          <h3 className="kicker">Search terms</h3>
          <ul className="mt-4 space-y-3">
            {terms.length === 0 && <li className="text-sm text-subtle">No query strings in this stream.</li>}
            {terms.slice(0, 20).map((row) => (
              <li key={row.label} className="flex justify-between gap-3 text-sm">
                <span className="truncate text-fg">{row.label}</span>
                <span className="font-mono text-xs tabular-nums text-muted">{row.value}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="bg-bg p-5">
          <h3 className="kicker">Landing pages</h3>
          <ul className="mt-4 space-y-3">
            {pages.slice(0, 16).map((page) => (
              <li key={page.path} className="flex justify-between gap-3 text-sm">
                <span className="min-w-0">
                  <span className="block truncate text-fg">{page.title}</span>
                  <span className="font-mono text-xs text-subtle">{page.path}</span>
                </span>
                <span className="font-mono text-xs tabular-nums">{page.value}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
      <section className="flex flex-wrap gap-2 border-t border-border px-5 py-4">
        {["google", "bing", "yahoo", "duckduckgo"].map((id) => (
          <span key={id} className="inline-flex items-center gap-2 text-xs text-muted">
            <ChannelLogo id={id} size="sm" /> {id}
          </span>
        ))}
      </section>
    </div>
  );
}
