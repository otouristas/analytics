import { createFileRoute } from "@tanstack/react-router";
import { ingestEvent, CYCLADES_WRITE_KEY } from "@/lib/analytics/ingest";
import { persistEvent } from "@/lib/analytics/warehouse";
import { updateIntegrationStatus } from "@/lib/analytics/integrations";

export const Route = createFileRoute("/api/webhooks/lemonsqueezy")({
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

        const meta = payload.meta as { event_name?: string } | undefined;
        const eventName = String(meta?.event_name ?? "");
        const dataObj = (payload.data as { attributes?: Record<string, unknown> } | undefined)?.attributes ?? {};
        const amountCents = typeof dataObj.total === "number" ? dataObj.total : typeof dataObj.subtotal === "number" ? dataObj.subtotal : 0;
        const currency = String(dataObj.currency ?? "EUR").toUpperCase();

        if (eventName === "order_created" || eventName === "subscription_payment_success") {
          const event = ingestEvent({
            writeKey: CYCLADES_WRITE_KEY,
            kind: "custom",
            label: "purchase",
            path: "/orders/lemonsqueezy",
            title: "Lemon Squeezy Order",
            valueType: "confirmed",
            amountCents,
            currency,
            props: { eventName, orderId: (payload.data as { id?: string } | undefined)?.id },
          });
          void persistEvent(event);
          updateIntegrationStatus("lemonsqueezy", "connected");
          return Response.json({ ok: true, id: event.id });
        }

        return Response.json({ ok: true, ignored: true });
      },
    },
  },
});
