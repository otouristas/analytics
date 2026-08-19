import { createFileRoute } from "@tanstack/react-router";
import { PROJECT_BY_ID, type ProjectId } from "@/lib/analytics/projects";
import type { IngestEvent } from "@/lib/analytics/ingest";
import { listEvents } from "@/lib/analytics/ingest";

export const Route = createFileRoute("/api/project-feed")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const projectId = url.searchParams.get("project") as ProjectId | null;
        const after = Number(url.searchParams.get("after") ?? 0);
        const project = projectId ? PROJECT_BY_ID[projectId] : undefined;
        const local = listEvents(Number.isFinite(after) ? after : 0).filter((event) =>
          project ? event.writeKey === project.writeKey || event.host.includes(project.host) : true,
        );

        if (!project?.feedUrl) {
          return Response.json({ ok: true, events: local, source: "local" });
        }

        try {
          const remote = await fetch(`${project.feedUrl}?after=${Number.isFinite(after) ? after : 0}`, {
            headers: { accept: "application/json" },
          });
          if (!remote.ok) {
            return Response.json({ ok: true, events: local, source: "local", remote: remote.status });
          }
          const body = (await remote.json()) as { events?: IngestEvent[] };
          const merged = [...(body.events ?? []), ...local];
          const seen = new Set<string>();
          const events = merged.filter((event) => {
            if (seen.has(event.id)) return false;
            seen.add(event.id);
            return true;
          });
          return Response.json({ ok: true, events, source: "remote" });
        } catch {
          return Response.json({ ok: true, events: local, source: "local" });
        }
      },
    },
  },
});
