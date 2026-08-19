export function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(1, ...values);
  const w = 160;
  const h = 36;
  const d = values
    .map((value, index) => {
      const x = values.length === 1 ? 0 : (index / (values.length - 1)) * w;
      const y = h - (value / max) * (h - 2) - 1;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-9 w-40 text-map-5" aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
