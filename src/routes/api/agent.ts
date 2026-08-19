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
        const metric = url.searchParams.get("metric");
        const breakdown = url.searchParams.get("breakdown");
        const includeBots = url.searchParams.get("bots") === "1";
        const period = url.searchParams.get("period") || "live";

        const project = PROJECTS.find((item) => item.writeKey === key || item.shareToken === key) ?? PROJECTS[0]!;
        const allEvents = listEvents(0).filter((event) => event.writeKey === project.writeKey);
        const events = includeBots ? allEvents : allEvents.filter((e) => !e.isBot);
        const botEvents = allEvents.filter((e) => e.isBot);

        const people = sessionsFromEvents(events);
        const live = livePeople(people);
        const stats = summarize(allEvents);
        const goals = goalStats(people);
        const demand = destinationDemand(people).slice(0, 12);
        const channels = channelQuality(people).slice(0, 12);

        // Metric-specific response
        if (metric) {
          return Response.json({
            ok: true,
            host: project.host,
            metric,
            value:
              metric === "live"
                ? live.length
                : metric === "sessions"
                  ? people.length
                  : metric === "pageviews"
                    ? stats.pageviews
                    : metric === "confirmed_revenue"
                      ? (stats.confirmedRevenueCents ?? 0) / 100
                      : metric === "bots"
                        ? botEvents.length
                        : null,
            period,
          });
        }

        // Breakdown response
        if (breakdown) {
          return Response.json({
            ok: true,
            host: project.host,
            breakdown,
            rows:
              breakdown === "sources"
                ? sourceCounts(people)
                : breakdown === "pages"
                  ? pageCounts(people)
                  : breakdown === "destinations"
                    ? demand
                    : breakdown === "bots"
                      ? stats.botTypes
                      : [],
          });
        }

        return Response.json({
          ok: true,
          product: "Meridian Analytics",
          host: project.host,
          model: "HEURISTIC",
          live: live.length,
          sessions: people.length,
          qualified: people.filter((person) => person.qualified).length,
          pageviews: stats.pageviews,
          confirmedRevenueCents: stats.confirmedRevenueCents,
          estimatedRevenueCents: stats.estimatedRevenueCents,
          goalsPerVisitor: Math.round(goals.perVisitor * 1000) / 10,
          destinations: demand,
          channelQuality: channels,
          botEventsCount: botEvents.length,
          botTypes: stats.botTypes,
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
