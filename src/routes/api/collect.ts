import { createFileRoute } from "@tanstack/react-router";
import { countryFromIso2, ingestEvent, isValidKey, type EventKind } from "@/lib/analytics/ingest";
import { persistEvent } from "@/lib/analytics/warehouse";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const KINDS: EventKind[] = [
  "pageview",
  "click",
  "outbound",
  "heartbeat",
  "exit",
  "custom",
  "vital",
  "scroll",
  "form",
  "download",
];

export const Route = createFileRoute("/api/collect")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        let body: Record<string, unknown> = {};
        const text = await request.text();
        if (text) {
          try {
            body = JSON.parse(text) as Record<string, unknown>;
          } catch {
            return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400, headers: CORS });
          }
        }
        const writeKey = String(body.writeKey ?? body.key ?? "");
        if (!isValidKey(writeKey)) {
          return Response.json({ ok: false, error: "Unknown write key" }, { status: 401, headers: CORS });
        }
        const headerCountry =
          request.headers.get("x-vercel-ip-country") ||
          request.headers.get("cf-ipcountry") ||
          request.headers.get("x-country");
        const geo = countryFromIso2(body.country ? String(body.country) : headerCountry);
        const rawKind = String(body.kind ?? body.event ?? "pageview");
        const kind = KINDS.includes(rawKind as EventKind) ? (rawKind as EventKind) : "custom";
        const event = ingestEvent({
          writeKey,
          sessionId: body.sessionId ? String(body.sessionId) : undefined,
          kind,
          host: body.host ? String(body.host) : "",
          path: String(body.path ?? "/"),
          title: String(body.title ?? "Page"),
          fromPath: body.fromPath ? String(body.fromPath) : "",
          href: body.href ? String(body.href) : "",
          label: body.label ? String(body.label) : "",
          source: String(body.source ?? "direct"),
          referrer: body.referrer ? String(body.referrer) : "",
          query: body.query ? String(body.query) : "",
          countryId: body.countryId ? String(body.countryId) : geo?.id,
          countryName: body.countryName ? String(body.countryName) : geo?.name,
          city: body.city ? String(body.city) : request.headers.get("x-vercel-ip-city") ?? undefined,
          device: body.device === "mobile" ? "mobile" : "desktop",
          os: body.os ? String(body.os) : "",
          browser: body.browser ? String(body.browser) : "",
          campaign: body.campaign ? String(body.campaign) : "",
          medium: body.medium ? String(body.medium) : "",
          name: body.name ? String(body.name) : undefined,
        });
        void persistEvent(event);
        return Response.json({ ok: true, id: event.id }, { headers: CORS });
      },
    },
  },
});
