import { createFileRoute } from "@tanstack/react-router";
import { ingestEvent, CYCLADES_WRITE_KEY } from "@/lib/analytics/ingest";
import { persistEvent } from "@/lib/analytics/warehouse";
import { updateIntegrationStatus } from "@/lib/analytics/integrations";

export const Route = createFileRoute("/api/webhooks/stripe")({
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
        const dataObj = (payload.data as { object?: Record<string, unknown> } | undefined)?.object ?? {};
        const amountCents = typeof dataObj.amount_total === "number" ? dataObj.amount_total : typeof dataObj.amount === "number" ? dataObj.amount : 0;
        const currency = String(dataObj.currency ?? "EUR").toUpperCase();
        const customerEmail = String(dataObj.customer_email ?? (dataObj.customer_details as { email?: string })?.email ?? "");

        if (type === "checkout.session.completed" || type === "invoice.paid" || type === "payment_intent.succeeded") {
          const event = ingestEvent({
            writeKey: CYCLADES_WRITE_KEY,
            kind: "custom",
            label: "booking_confirmed",
            path: "/checkout/success",
            title: "Booking Confirmed (Stripe)",
            source: "direct",
            valueType: "confirmed",
            amountCents,
            currency,
            props: {
              stripeEventId: payload.id,
              type,
              customerEmail: customerEmail ? customerEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3") : undefined,
            },
          });
          void persistEvent(event);
          updateIntegrationStatus("stripe", "connected");
          return Response.json({ ok: true, received: true, eventId: event.id });
        }

        if (type === "charge.refunded") {
          const refundEvent = ingestEvent({
            writeKey: CYCLADES_WRITE_KEY,
            kind: "custom",
            label: "refund",
            path: "/refund",
            valueType: "confirmed",
            amountCents: -Math.abs(amountCents),
            currency,
            props: { stripeEventId: payload.id, type },
          });
          void persistEvent(refundEvent);
          updateIntegrationStatus("stripe", "connected");
          return Response.json({ ok: true, received: true, refund: true });
        }

        return Response.json({ ok: true, ignored: true, type });
      },
    },
  },
});
