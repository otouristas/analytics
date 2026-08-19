import { createFileRoute } from "@tanstack/react-router";
import { PROJECTS } from "@/lib/analytics/projects";
import { loadHistory } from "@/lib/analytics/warehouse";

export const Route = createFileRoute("/api/history")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const key = url.searchParams.get("key") || PROJECTS[0]!.writeKey;
        try {
          const events = await loadHistory(key);
          return Response.json({ ok: true, events });
        } catch {
          return Response.json({ ok: false, events: [] });
        }
      },
    },
  },
});
