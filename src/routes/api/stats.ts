import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";

export const Route = createFileRoute("/api/stats")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const writeKey = url.searchParams.get("key") || "";
        try {
          const sql = await getSql();
          const kinds = await sql.query<{ event_name: string; n: number }>(
            `select event_name, count(*)::int as n
             from meridian_events
             where ($1 = '' or write_key = $1)
             group by event_name
             order by n desc`,
            [writeKey],
          );
          const last = await sql.query<{ ts: string }>(
            `select ts::text as ts from meridian_events
             where ($1 = '' or write_key = $1)
             order by ts desc limit 1`,
            [writeKey],
          );
          return Response.json({
            ok: true,
            kinds,
            last: last[0]?.ts ?? null,
            stored: kinds.reduce((sum, row) => sum + row.n, 0),
          });
        } catch {
          return Response.json({ ok: false, kinds: [], last: null, stored: 0 });
        }
      },
    },
  },
});
