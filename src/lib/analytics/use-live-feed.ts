import { useEffect, useMemo } from "react";
import { summarize } from "./ingest";
import { PROJECT_BY_ID } from "./projects";
import {
  liveByCountry,
  livePeople,
  normalizeEvent,
  pageCounts,
  pulseLine,
  sessionsFromEvents,
  sourceCounts,
} from "./realtime";
import { filterEvents, windowEvents } from "./insights";
import { useAnalytics } from "./store";

export function useLiveFeed() {
  const projectId = useAnalytics((s) => s.projectId);
  const setFeed = useAnalytics((s) => s.setFeed);
  const events = useAnalytics((s) => s.events);
  const status = useAnalytics((s) => s.feedStatus);
  const project = PROJECT_BY_ID[projectId];

  useEffect(() => {
    let after = 0;
    let cancelled = false;
    setFeed([], "connecting");

    const pull = async () => {
      const url = project.feedUrl
        ? `/api/project-feed?project=${project.id}&after=${after}`
        : `/api/live?after=${after}`;
      try {
        const res = await fetch(url);
        if (!res.ok) {
          if (!cancelled) setFeed(useAnalytics.getState().events, after ? "live" : "error");
          return;
        }
        const body = (await res.json()) as { events?: Parameters<typeof normalizeEvent>[0][] };
        const next = (body.events ?? [])
          .filter((event) =>
            project.writeKey ? event.writeKey === project.writeKey || !event.writeKey : true,
          )
          .map(normalizeEvent);
        if (cancelled) return;
        if (next[0]) after = Math.max(after, ...next.map((event) => event.ts));
        const current = useAnalytics.getState().events;
        const seen = new Set(current.map((item) => item.id));
        const merged = [...next.filter((item) => !seen.has(item.id)), ...current].slice(0, 800);
        setFeed(merged, merged.length ? "live" : "empty");
      } catch {
        if (!cancelled) setFeed(useAnalytics.getState().events, after ? "live" : "error");
      }
    };

    void pull();
    const id = window.setInterval(() => void pull(), 2000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [project.feedUrl, project.id, project.writeKey, setFeed]);

  return { events, status, project };
}

export function useRealtime() {
  const raw = useAnalytics((s) => s.events);
  const status = useAnalytics((s) => s.feedStatus);
  const projectId = useAnalytics((s) => s.projectId);
  const streamWindow = useAnalytics((s) => s.streamWindow);
  const deviceFilter = useAnalytics((s) => s.deviceFilter);
  const countryFilter = useAnalytics((s) => s.countryFilter);
  const channelFilter = useAnalytics((s) => s.channelFilter);
  const pathFilter = useAnalytics((s) => s.pathFilter);
  const project = PROJECT_BY_ID[projectId];
  const events = useMemo(
    () =>
      filterEvents(windowEvents(raw, streamWindow), {
        device: deviceFilter,
        country: countryFilter,
        channel: channelFilter,
        path: pathFilter,
      }),
    [raw, streamWindow, deviceFilter, countryFilter, channelFilter, pathFilter],
  );
  const people = useMemo(() => sessionsFromEvents(events), [events]);
  const live = useMemo(() => livePeople(people), [people]);
  const byCountry = useMemo(() => liveByCountry(people), [people]);
  const stats = useMemo(() => summarize(events), [events]);
  const pulse = useMemo(() => pulseLine(people), [people]);
  const sources = useMemo(() => sourceCounts(people), [people]);
  const pages = useMemo(() => pageCounts(people), [people]);
  return { events, status, project, people, live, byCountry, stats, pulse, sources, pages };
}
