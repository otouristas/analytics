import { createFileRoute } from "@tanstack/react-router";
import { ingestEvent, CYCLADES_WRITE_KEY } from "@/lib/analytics/ingest";
import { persistEvent } from "@/lib/analytics/warehouse";
import { updateIntegrationStatus } from "@/lib/analytics/integrations";

export const Route = createFileRoute("/api/webhooks/polar")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const text = await request.text();
        let payload: Record<string, unknown> = {};
        try {
          payload = JSON.parse(text) as Record<string, unknown>;
        } catch {
          return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
        }

        const type = String(payload.type ?? "");
        const dataObj = (payload.data as Record<string, unknown> | undefined) ?? {};
        const amountCents = typeof dataObj.amount === "number" ? dataObj.amount : typeof dataObj.total_amount === "number" ? dataObj.total_amount : 0;
        const currency = String(dataObj.currency ?? "EUR").toUpperCase();

        if (type === "order.paid" || type === "order.created") {
          const event = ingestEvent({
            writeKey: CYCLADES_WRITE_KEY,
            kind: "custom",
            label: "purchase",
            path: "/orders/polar",
            title: "Polar Purchase",
            valueType: "confirmed",
            amountCents,
            currency,
            props: { polarOrderId: dataObj.id, type },
          });
          void persistEvent(event);
          updateIntegrationStatus("polar", "connected");
          return Response.json({ ok: true, id: event.id });
        }

        return Response.json({ ok: true, ignored: true });
      },
    },
  },
});
