import { createFileRoute } from "@tanstack/react-router";
import { ingestEvent, isValidKey } from "@/lib/analytics/ingest";
import { persistEvent } from "@/lib/analytics/warehouse";

const seenTransactions = new Set<string>();

export const Route = createFileRoute("/api/payments")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Record<string, unknown> = {};
        try {
          const text = await request.text();
          body = JSON.parse(text) as Record<string, unknown>;
        } catch {
          return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
        }

        const writeKey = String(body.writeKey ?? body.key ?? "");
        if (!isValidKey(writeKey)) {
          return Response.json({ ok: false, error: "Invalid write key" }, { status: 401 });
        }

        const txId = String(body.transaction_id ?? body.txId ?? `tx_${Date.now()}`);
        if (seenTransactions.has(txId)) {
          return Response.json({ ok: true, duplicate: true, transaction_id: txId });
        }
        seenTransactions.add(txId);

        const amountCents = typeof body.amount_cents === "number" ? body.amount_cents : 0;
        const currency = String(body.currency ?? "EUR").toUpperCase();
        const outboundClickId = body.outbound_click_id ? String(body.outbound_click_id) : undefined;

        const event = ingestEvent({
          writeKey,
          kind: "custom",
          label: "purchase",
          path: "/checkout/confirmation",
          title: "Confirmed Transaction",
          valueType: "confirmed",
          amountCents,
          currency,
          props: {
            transactionId: txId,
            outboundClickId,
          },
        });

        void persistEvent(event);
        return Response.json({ ok: true, id: event.id, transaction_id: txId, amount_cents: amountCents, currency });
      },
    },
  },
});
