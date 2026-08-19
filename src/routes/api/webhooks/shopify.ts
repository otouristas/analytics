import { createFileRoute } from "@tanstack/react-router";
import { ingestEvent, CYCLADES_WRITE_KEY } from "@/lib/analytics/ingest";
import { persistEvent } from "@/lib/analytics/warehouse";
import { updateIntegrationStatus } from "@/lib/analytics/integrations";

export const Route = createFileRoute("/api/webhooks/shopify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const hmac = request.headers.get("x-shopify-hmac-sha256");
        const topic = request.headers.get("x-shopify-topic") || "orders/paid";
        const secret = process.env.SHOPIFY_WEBHOOK_SECRET;

        // In production with a configured secret, reject unsigned requests
        if (secret && !hmac) {
          return Response.json({ ok: false, error: "Missing HMAC signature" }, { status: 401 });
        }

        const text = await request.text();
        let order: Record<string, unknown> = {};
        try {
          order = JSON.parse(text) as Record<string, unknown>;
        } catch {
          return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
        }

        const total = parseFloat(String(order.total_price ?? order.current_total_price ?? "0"));
        const amountCents = Math.round(total * 100);
        const currency = String(order.currency ?? "EUR").toUpperCase();

        const event = ingestEvent({
          writeKey: CYCLADES_WRITE_KEY,
          kind: "custom",
          label: topic.includes("refund") ? "refund" : "purchase",
          path: "/orders/shopify",
          title: `Shopify ${topic}`,
          valueType: "confirmed",
          amountCents: topic.includes("refund") ? -Math.abs(amountCents) : amountCents,
          currency,
          props: {
            shopifyOrderId: order.id,
            orderNumber: order.order_number,
            topic,
          },
        });

        void persistEvent(event);
        updateIntegrationStatus("shopify", "connected");
        return Response.json({ ok: true, id: event.id });
      },
    },
  },
});
