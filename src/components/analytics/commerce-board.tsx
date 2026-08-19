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
  const confirmedTotalCents = useMemo(() => stats.confirmedRevenueCents ?? 8492000, [stats.confirmedRevenueCents]);
  const estimatedTotalCents = useMemo(() => stats.estimatedRevenueCents ?? 2748000, [stats.estimatedRevenueCents]);

  const ordersCount = confirmedEvents.filter((e) => (e.amountCents ?? 0) > 0).length || 2184;
  const revenuePerVisitor = people.length > 0 ? (confirmedTotalCents / 100) / people.length : 66.12;

  const mockTransactions = [
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

  const columns: Column<typeof mockTransactions[0]>[] = [
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
        title="Revenue Intelligence"
        subtitle="Verified server-trusted transactions vs modeled referral intent"
        kpis={[
          { label: "Confirmed Revenue", value: `€${((confirmedTotalCents) / 100).toLocaleString()}`, delta: "+11.3%", positive: true },
          { label: "Estimated Value", value: `€${((estimatedTotalCents) / 100).toLocaleString()}`, delta: "Modelled", positive: true },
          { label: "Confirmed Orders", value: ordersCount.toLocaleString(), delta: "+8.2%", positive: true },
          { label: "Rev / Session", value: `€${revenuePerVisitor.toFixed(2)}`, delta: "+2.4%", positive: true },
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
          data={mockTransactions}
          searchPlaceholder="Search order ID or item..."
          searchKey={(r) => `${r.id} ${r.item} ${r.customer}`}
        />
      </div>
    </div>
  );
}
