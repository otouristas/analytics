import { createFileRoute } from "@tanstack/react-router";
import { listEvents } from "@/lib/analytics/ingest";

export const Route = createFileRoute("/api/live")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const url = new URL(request.url);
        const after = Number(url.searchParams.get("after") ?? 0);
        return Response.json({ ok: true, events: listEvents(Number.isFinite(after) ? after : 0) });
      },
    },
  },
});
