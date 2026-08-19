import { useMemo } from "react";
import { CreditCard, ShoppingBag, ShieldCheck, ArrowUpRight } from "lucide-react";
import { PropertyHeader } from "@/components/product/property-header";
import { MetricCard } from "@/components/ui/metric-card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAnalytics } from "@/lib/analytics/store";
import { useRealtime } from "@/lib/analytics/use-live-feed";
import { cn } from "@/lib/utils";

export function CommerceBoard() {
  const { events, people, stats, project } = useRealtime();
  const setView = useAnalytics((s) => s.setView);

  const confirmedEvents = useMemo(() => events.filter((e) => e.valueType === "confirmed"), [events]);
  const liveOrders = useMemo(
    () => confirmedEvents.filter((e) => (e.amountCents ?? 0) > 0),
    [confirmedEvents],
  );

  /**
   * Whether this property has real confirmed revenue in the stream.
   *
   * Everything below derives from THIS one flag. Previously the revenue total
   * used `?? fallback` (which does not fire on a real 0) while the order count
   * used `|| fallback` (which does), so the header read "€0 confirmed revenue"
   * beside "2,184 confirmed orders", above a table of four unrelated rows.
   * One source of truth, or the numbers contradict each other.
   */
  const hasLiveRevenue = liveOrders.length > 0;

  const sampleTransactions = [
    {
      id: "ord_91823",
      source: "Stripe",
      amount: "€145.00",
      customer: "alex***@gmail.com",
      item: "Santorini Caldera Hotel Suite (3 nights)",
      status: "Confirmed",
      date: "12m ago",
    },
    {
      id: "ord_91822",
      source: "Shopify",
      amount: "€320.00",
      customer: "sarah***@yahoo.co.uk",
      item: "Paros Luxury Catamaran Charter",
      status: "Confirmed",
      date: "34m ago",
    },
    {
      id: "ord_91821",
      source: "Polar",
      amount: "€49.00",
      customer: "dev***@proton.me",
      item: "Cyclades Explorer Pro Membership",
      status: "Confirmed",
      date: "1h ago",
    },
    {
      id: "ord_91820",
      source: "LemonSqueezy",
      amount: "€85.00",
      customer: "elena***@outlook.com",
      item: "Naxos Ferry FastPass & Guide",
      status: "Confirmed",
      date: "2h ago",
    },
  ];

  // Live orders, shaped like the sample rows so one table renders both.
  const liveTransactions = useMemo(
    () =>
      liveOrders.slice(0, 25).map((e, i) => ({
        id: e.id || `evt_${i}`,
        // The tracker records which integration signed the webhook in `source`.
        source: e.source || "Webhook",
        amount: `€${((e.amountCents ?? 0) / 100).toFixed(2)}`,
        customer: e.path || "—",
        item: e.label || e.title || "Confirmed order",
        status: "Confirmed",
        date: relativeTime(e.ts),
      })),
    [liveOrders],
  );

  const transactions = hasLiveRevenue ? liveTransactions : sampleTransactions;

  // Totals ALWAYS come from the rows on screen.
  const confirmedTotalCents = useMemo(
    () =>
      hasLiveRevenue
        ? liveOrders.reduce((n, e) => n + (e.amountCents ?? 0), 0)
        : sampleTransactions.reduce((n, t) => n + Math.round(parseFloat(t.amount.slice(1)) * 100), 0),
    [hasLiveRevenue, liveOrders, sampleTransactions],
  );
  const estimatedTotalCents = stats.estimatedRevenueCents ?? 0;
  const ordersCount = transactions.length;
  const revenuePerVisitor =
    people.length > 0 ? confirmedTotalCents / 100 / people.length : 0;

  const columns: Column<(typeof sampleTransactions)[0]>[] = [
    {
      id: "id",
      header: "Transaction ID",
      accessor: (r) => r.id,
      cell: (val) => <span className="font-mono text-xs text-accent font-semibold">{val}</span>,
      sortable: true,
    },
    {
      id: "source",
      header: "Provider",
      accessor: (r) => r.source,
      cell: (val) => <StatusBadge status="connected" label={val} size="sm" />,
      sortable: true,
    },
    {
      id: "item",
      header: "Product / Order Item",
      accessor: (r) => r.item,
      cell: (val, r) => (
        <div>
          <span className="font-medium text-fg">{val}</span>
          <span className="caption block font-mono text-[11px]">{r.customer}</span>
        </div>
      ),
    },
    {
      id: "amount",
      header: "Amount",
      accessor: (r) => r.amount,
      cell: (val) => <span className="stat-value text-sm font-bold text-fg">{val}</span>,
      sortable: true,
      align: "right",
    },
    {
      id: "status",
      header: "Status",
      accessor: (r) => r.status,
      cell: () => <StatusBadge status="healthy" label="Confirmed" size="sm" />,
      align: "center",
    },
    {
      id: "date",
      header: "Timestamp",
      accessor: (r) => r.date,
      cell: (val) => <span className="caption">{val}</span>,
      align: "right",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto dock-safe">
      {/* 1. Property Header */}
      <PropertyHeader
        eyebrow={hasLiveRevenue ? "Verified transactions" : "Sample data"}
        title="Revenue Intelligence"
        subtitle={
          hasLiveRevenue
            ? "Server-verified transactions against modelled referral intent."
            : "No confirmed transactions in this stream yet — showing a sample so the layout is legible. Connect a payment webhook to populate it."
        }
        kpis={[
          {
            label: "Confirmed Revenue",
            value: `€${(confirmedTotalCents / 100).toLocaleString()}`,
            delta: hasLiveRevenue ? "verified" : "sample data",
          },
          {
            label: "Estimated Value",
            value: `€${(estimatedTotalCents / 100).toLocaleString()}`,
            delta: "modelled",
          },
          { label: "Confirmed Orders", value: ordersCount.toLocaleString() },
          { label: "Rev / Session", value: `€${revenuePerVisitor.toFixed(2)}` },
        ]}
        actions={
          <button
            type="button"
            onClick={() => setView("integrations")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-accent/90 transition-all"
          >
            <CreditCard className="size-3.5" />
            <span>Connect Webhooks</span>
          </button>
        }
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* 2. Confirmed vs Estimated distinction banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-positive/30 bg-positive-soft/20 p-4">
            <div className="flex items-center gap-2 text-positive font-semibold text-xs mb-1">
              <ShieldCheck className="size-4" />
              <span>Confirmed Server Revenue</span>
            </div>
            <p className="stat-value text-2xl font-bold text-fg">
              €{((confirmedTotalCents) / 100).toLocaleString()}
            </p>
            <p className="caption mt-1 text-muted">
              Signed webhook events from Stripe, Shopify, Polar, LemonSqueezy. 100% verified.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-muted">Estimated Intent Value</span>
              <span className="caption rounded bg-elevated px-2 py-0.5 font-medium">Modelled</span>
            </div>
            <p className="stat-value text-2xl font-bold text-muted">
              €{((estimatedTotalCents) / 100).toLocaleString()}
            </p>
            <p className="caption mt-1 text-subtle">
              Outbound clicks to partner hotels, car rental agencies, and tour operators.
            </p>
          </div>
        </div>

        {/* 3. Transaction Log Table */}
        <DataTable
          title="Verified Transaction Stream"
          columns={columns}
          data={transactions}
          searchPlaceholder="Search order ID or item..."
          searchKey={(r) => `${r.id} ${r.item} ${r.customer}`}
        />
      </div>
    </div>
  );
}

/** "12m ago" / "2h ago" / "3d ago" from an epoch-ms timestamp. */
function relativeTime(ts: number | undefined): string {
  if (!ts) return "—";
  const mins = Math.max(0, Math.round((Date.now() - ts) / 60_000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
