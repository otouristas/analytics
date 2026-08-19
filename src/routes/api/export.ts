import { createFileRoute } from "@tanstack/react-router";
import { eventsToCsv } from "@/lib/analytics/export";
import { listEvents } from "@/lib/analytics/ingest";

export const Route = createFileRoute("/api/export")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const url = new URL(request.url);
        const key = url.searchParams.get("key") || "";
        const events = listEvents(0).filter((event) => !key || event.writeKey === key);
        const csv = eventsToCsv(events);
        return new Response(csv, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="meridian.csv"`,
          },
        });
      },
    },
  },
});
