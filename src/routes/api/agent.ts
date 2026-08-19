import { createFileRoute } from "@tanstack/react-router";
import { listEvents, summarize } from "@/lib/analytics/ingest";
import { destinationDemand, channelQuality } from "@/lib/analytics/demand";
import { goalStats } from "@/lib/analytics/goals";
import { PROJECTS } from "@/lib/analytics/projects";
import { sessionsFromEvents, sourceCounts, pageCounts, livePeople } from "@/lib/analytics/realtime";

export const Route = createFileRoute("/api/agent")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const url = new URL(request.url);
        const key = url.searchParams.get("key") || "";
        const project = PROJECTS.find((item) => item.writeKey === key || item.shareToken === key) ?? PROJECTS[0]!;
        const events = listEvents(0).filter((event) => event.writeKey === project.writeKey);
        const people = sessionsFromEvents(events);
        const live = livePeople(people);
        const stats = summarize(events);
        const goals = goalStats(people);
        const demand = destinationDemand(people).slice(0, 8);
        const channels = channelQuality(people).slice(0, 8);
        return Response.json({
          ok: true,
          product: "Meridian Analytics",
          host: project.host,
          model: "HEURISTIC",
          live: live.length,
          sessions: people.length,
          qualified: people.filter((person) => person.qualified).length,
          pageviews: stats.pageviews,
          goalsPerVisitor: Math.round(goals.perVisitor * 1000) / 10,
          destinations: demand,
          channelQuality: channels,
          sources: sourceCounts(people).slice(0, 12),
          pages: pageCounts(people).slice(0, 12),
          now: live.slice(0, 12).map((person) => ({
            city: person.city,
            country: person.countryName,
            path: person.path,
            source: person.source,
            intent: person.intentScore,
          })),
        });
      },
    },
  },
});
