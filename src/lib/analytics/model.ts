export type Region = "Americas" | "EMEA" | "APAC";

export type MetricId = "revenue" | "users" | "growth" | "conversion" | "arpu";

export type RangeId = "30d" | "90d" | "ytd" | "12m";

export type Country = {
  id: string;
  iso3: string;
  name: string;
  region: Region;
  population: number;
  revenue: number;
  users: number;
  growth: number;
  conversion: number;
  arpu: number;
  revenueSeries: number[];
  usersSeries: number[];
};

export type MetricDef = {
  id: MetricId;
  label: string;
  short: string;
  description: string;
  unit: "usd" | "count" | "pct";
  scale: "quantile" | "diverging";
  accessor: (country: Country) => number;
  series: (country: Country) => number[];
};

export const RANGES: { id: RangeId; label: string; factor: number }[] = [
  { id: "30d", label: "30 days", factor: 0.33 },
  { id: "90d", label: "90 days", factor: 1 },
  { id: "ytd", label: "Year to date", factor: 2.68 },
  { id: "12m", label: "12 months", factor: 4.05 },
];

export const METRICS: MetricDef[] = [
  {
    id: "revenue",
    label: "Revenue",
    short: "Rev",
    description: "Processed volume across the selected window",
    unit: "usd",
    scale: "quantile",
    accessor: (c) => c.revenue,
    series: (c) => c.revenueSeries,
  },
  {
    id: "users",
    label: "Active users",
    short: "Users",
    description: "Unique actives who completed a session",
    unit: "count",
    scale: "quantile",
    accessor: (c) => c.users,
    series: (c) => c.usersSeries,
  },
  {
    id: "growth",
    label: "Growth",
    short: "Growth",
    description: "Period-over-period change in revenue",
    unit: "pct",
    scale: "diverging",
    accessor: (c) => c.growth,
    series: (c) => c.revenueSeries,
  },
  {
    id: "conversion",
    label: "Conversion",
    short: "CVR",
    description: "Share of sessions that convert to paid",
    unit: "pct",
    scale: "quantile",
    accessor: (c) => c.conversion,
    series: (c) => c.usersSeries.map((u, i) => u * c.conversion * (0.92 + (i / 24))),
  },
  {
    id: "arpu",
    label: "ARPU",
    short: "ARPU",
    description: "Average revenue per active user",
    unit: "usd",
    scale: "quantile",
    accessor: (c) => c.arpu,
    series: (c) => c.revenueSeries.map((r, i) => r / Math.max(1, c.usersSeries[i] ?? 1)),
  },
];

export const METRIC_BY_ID = Object.fromEntries(
  METRICS.map((m) => [m.id, m]),
) as Record<MetricId, MetricDef>;

export const QUANTILE_COLORS = [
  "var(--color-map-1)",
  "var(--color-map-2)",
  "var(--color-map-3)",
  "var(--color-map-4)",
  "var(--color-map-5)",
  "var(--color-map-6)",
  "var(--color-map-7)",
] as const;

export const DIVERGING_COLORS = [
  "var(--color-map-neg-3)",
  "var(--color-map-neg-2)",
  "var(--color-map-neg-1)",
  "var(--color-map-mid)",
  "var(--color-map-pos-1)",
  "var(--color-map-pos-2)",
  "var(--color-map-pos-3)",
] as const;

export function rangeFactor(range: RangeId): number {
  return RANGES.find((r) => r.id === range)?.factor ?? 1;
}

export function scaledValue(country: Country, metric: MetricId, range: RangeId): number {
  const def = METRIC_BY_ID[metric];
  const raw = def.accessor(country);
  if (def.unit === "pct") return raw;
  if (metric === "arpu") return raw;
  return raw * rangeFactor(range);
}

export function formatUsd(value: number, compact = true): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (!compact) {
    return `${sign}$${Math.round(abs).toLocaleString("en-US")}`;
  }
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

export function formatCount(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1)}K`;
  return `${sign}${Math.round(abs).toLocaleString("en-US")}`;
}

export function formatPct(value: number, signed = false): string {
  const pct = value * 100;
  const body = `${Math.abs(pct).toFixed(1)}%`;
  if (!signed) return value < 0 ? `-${body}` : body;
  if (pct > 0) return `+${body}`;
  if (pct < 0) return `-${body}`;
  return body;
}

export function formatMetric(value: number, metric: MetricId, compact = true): string {
  const def = METRIC_BY_ID[metric];
  if (def.unit === "usd") return formatUsd(value, compact);
  if (def.unit === "pct") return formatPct(value, metric === "growth");
  return formatCount(value);
}

export const MONTH_LABELS = [
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
];
