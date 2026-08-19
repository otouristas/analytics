import { cn } from "@/lib/utils";

/**
 * Inline trend line.
 *
 * Sizes to its container by default rather than to a fixed pixel box: it is
 * dropped into slots as small as 56x20 (health cards) and as wide as a table
 * cell, and a hard-coded width silently overflows the smaller ones. The
 * viewBox keeps the geometry; `preserveAspectRatio="none"` lets it stretch.
 */
export function Sparkline({
  values,
  className,
}: {
  values: number[];
  className?: string;
}) {
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
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={cn("h-full w-full text-accent", className)}
      aria-hidden="true"
    >
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
