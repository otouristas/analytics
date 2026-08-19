import { ChannelLogo } from "@/components/analytics/channel-logo";
import { goalStats } from "@/lib/analytics/goals";
import { PROJECTS } from "@/lib/analytics/projects";
import { useAnalytics } from "@/lib/analytics/store";
import { useLiveFeed, useRealtime } from "@/lib/analytics/use-live-feed";
import { useEffect, useMemo } from "react";

export function ShareBoard({ token }: { token: string }) {
  const setProjectId = useAnalytics((s) => s.setProjectId);
  const project = PROJECTS.find((item) => item.shareToken === token) ?? PROJECTS[0]!;

  useEffect(() => {
    setProjectId(project.id);
  }, [project.id, setProjectId]);

  useLiveFeed();
  const { live, people, sources, pages, status } = useRealtime();
  const goals = useMemo(() => goalStats(people), [people]);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <p className="font-display text-2xl italic text-fg">Meridian</p>
          <p className="text-xs text-subtle">{project.host} · live share</p>
        </div>
        <span className="live-dot size-2 rounded-full bg-positive" />
      </header>
      <section className="px-5 py-8">
        <p className="kicker">On site now</p>
        <p className="display-stat mt-2 text-7xl text-fg">{live.length}</p>
        <p className="mt-2 text-sm text-muted">
          {status === "live" ? `${people.length} sessions in this stream` : "Connecting…"}
        </p>
        <p className="mt-4 font-display text-3xl italic text-fg">
          {Math.round(goals.perVisitor * 1000) / 10}
          <span className="ml-2 text-lg not-italic text-muted">goals / 100 visitors</span>
        </p>
      </section>
      <section className="grid gap-px border-t border-border bg-border sm:grid-cols-2">
        <article className="bg-bg p-5">
          <h2 className="kicker">Channels</h2>
          <ul className="mt-4 space-y-3">
            {sources.slice(0, 8).map(([id, value]) => (
              <li key={id} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2">
                  <ChannelLogo id={id} size="sm" />
                  {id}
                </span>
                <span className="font-mono text-xs tabular-nums">{value}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="bg-bg p-5">
          <h2 className="kicker">Pages</h2>
          <ul className="mt-4 space-y-3">
            {pages.slice(0, 8).map((page) => (
              <li key={page.path} className="flex justify-between gap-3 text-sm">
                <span className="truncate">{page.title}</span>
                <span className="font-mono text-xs tabular-nums">{page.value}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
      <p className="px-5 py-6 text-xs text-subtle">Shared from Meridian Analytics. Numbers are first-party hits.</p>
    </div>
  );
}
