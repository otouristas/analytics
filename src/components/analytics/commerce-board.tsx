import { useRealtime } from "@/lib/analytics/use-live-feed";
import { PageShell } from "@/components/analytics/page-shell";
import { CreditCard, ShoppingBag, ShieldCheck, ArrowUpRight, HelpCircle } from "lucide-react";
import { useMemo } from "react";
import { useAnalytics } from "@/lib/analytics/store";
import { Button } from "@/components/ui/button";

export function CommerceBoard() {
  const { events, people, stats, project } = useRealtime();
  const setView = useAnalytics((s) => s.setView);

  const confirmedEvents = useMemo(() => events.filter((e) => e.valueType === "confirmed"), [events]);
  const confirmedTotalCents = useMemo(() => stats.confirmedRevenueCents ?? 0, [stats.confirmedRevenueCents]);
  const estimatedTotalCents = useMemo(() => stats.estimatedRevenueCents ?? (stats.outbound * 250), [stats]);

  const ordersCount = confirmedEvents.filter((e) => (e.amountCents ?? 0) > 0).length;
  const refundsCount = confirmedEvents.filter((e) => (e.amountCents ?? 0) < 0).length;
  const revenuePerVisitor = people.length > 0 ? (confirmedTotalCents / 100) / people.length : 0;

  return (
    <PageShell
      kicker={`Commerce &amp; Transactions · ${project.host}`}
      title="Verified Business Revenue"
      dek="Strictly separates server-verified payment events (Stripe, Shopify, Polar, LemonSqueezy) from client referral outbound clicks."
      actions={
        <Button variant="outline" size="sm" onClick={() => setView("install")}>
          <CreditCard className="mr-1 size-3.5" />
          Setup Webhooks
        </Button>
      }
    >
      {/* Revenue KPI Strip */}
      <section className="grid gap-px bg-border sm:grid-cols-4">
        <article className="bg-bg p-5">
          <p className="kicker">Confirmed Revenue</p>
          <p className="display-stat mt-2 text-4xl text-fg">
            €{(confirmedTotalCents / 100).toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-subtle">server-verified transactions</p>
        </article>

        <article className="bg-bg p-5">
          <p className="kicker">Confirmed Orders</p>
          <p className="display-stat mt-2 text-4xl text-fg">{ordersCount}</p>
          <p className="mt-1 text-xs text-subtle">{refundsCount} refund(s) processed</p>
        </article>

        <article className="bg-bg p-5">
          <p className="kicker">Revenue / Visitor</p>
          <p className="display-stat mt-2 text-4xl text-fg">
            €{revenuePerVisitor.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-subtle">across {people.length} active sessions</p>
        </article>

        <article className="bg-bg p-5">
          <div className="flex items-center justify-between">
            <p className="kicker">Estimated Referral Value</p>
            <span className="rounded bg-elevated px-1.5 py-0.5 text-[10px] text-muted">Estimated</span>
          </div>
          <p className="display-stat mt-2 text-4xl text-muted">
            €{(estimatedTotalCents / 100).toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-subtle">modeled partner outbound click intent</p>
        </article>
      </section>

      {/* Transaction Log */}
      <section className="p-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-display text-xl italic text-fg">Confirmed Transaction Ledger</h3>
          <span className="flex items-center gap-1 text-xs text-positive">
            <ShieldCheck className="size-3.5" /> Cryptographically Verified Webhooks
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-subtle border-b border-border">
              <tr>
                <th className="py-2.5">Date &amp; Time</th>
                <th className="py-2.5">Type / Source</th>
                <th className="py-2.5">Order / Session ID</th>
                <th className="py-2.5 text-right">Amount</th>
                <th className="py-2.5 text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {confirmedEvents.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-subtle">
                    <ShoppingBag className="mx-auto size-8 opacity-40 mb-2" />
                    <p className="font-medium text-fg">No confirmed transactions captured yet</p>
                    <p className="mt-1 text-xs text-muted max-w-md mx-auto">
                      Discover Cyclades is content-led. Revenue will populate as soon as Stripe, Shopify, or LemonSqueezy webhook events are received.
                    </p>
                  </td>
                </tr>
              )}
              {confirmedEvents.map((tx) => (
                <tr key={tx.id} className="hover:bg-surface/30">
                  <td className="py-3 font-mono text-xs text-subtle">
                    {new Date(tx.ts).toLocaleString()}
                  </td>
                  <td className="py-3 text-xs capitalize text-fg font-medium">
                    {tx.title || tx.label}
                  </td>
                  <td className="py-3 font-mono text-xs text-muted">
                    {String(tx.props?.stripeEventId ?? tx.props?.shopifyOrderId ?? tx.id).slice(0, 16)}…
                  </td>
                  <td className={`py-3 text-right font-mono text-sm font-semibold ${(tx.amountCents ?? 0) >= 0 ? "text-positive" : "text-danger"}`}>
                    {(tx.amountCents ?? 0) >= 0 ? "+" : "-"}€{Math.abs((tx.amountCents ?? 0) / 100).toFixed(2)}
                  </td>
                  <td className="py-3 text-right">
                    <span className="rounded bg-positive/10 px-2 py-0.5 font-mono text-[10px] text-positive">
                      CONFIRMED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Compliance Note */}
      <section className="p-5">
        <div className="rounded-xl bg-elevated p-4 text-xs text-muted leading-relaxed">
          <p className="font-semibold text-fg flex items-center gap-1.5">
            <HelpCircle className="size-3.5 text-subtle" /> Verified Revenue Accounting Policy
          </p>
          <p className="mt-1">
            Meridian Analytics strictly adheres to trusted financial attribution. Client-side partner outbound clicks or button taps are classified under <em>Estimated Referral Value</em> and never conflated with confirmed business revenue.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
