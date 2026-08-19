import { cn } from "@/lib/utils";

type LogoVariant = "full" | "mark" | "compact";
type LogoSize = "sm" | "md" | "lg" | "xl";

const SIZES: Record<LogoSize, { mark: number; text: string; gap: string }> = {
  sm: { mark: 20, text: "text-sm", gap: "gap-1.5" },
  md: { mark: 24, text: "text-base", gap: "gap-2" },
  lg: { mark: 32, text: "text-xl", gap: "gap-2.5" },
  xl: { mark: 40, text: "text-2xl", gap: "gap-3" },
};

/**
 * Meridian logo — geometric coordinate mark + wordmark.
 * The mark represents intersecting meridian lines (latitude/longitude crosshair),
 * suggesting navigation, measurement, and directional intelligence.
 */
export function MeridianLogo({
  variant = "full",
  size = "md",
  className,
}: {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
}) {
  const s = SIZES[size];

  const mark = (
    <svg
      width={s.mark}
      height={s.mark}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden="true"
    >
      {/* Outer circle — globe/coordinate reference */}
      <circle cx="12" cy="12" r="10.5" stroke="currentColor" strokeWidth="1.2" opacity="0.25" />
      {/* Vertical meridian */}
      <path
        d="M12 2C14.5 5.5 15.5 8.5 15.5 12C15.5 15.5 14.5 18.5 12 22"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.5"
      />
      <path
        d="M12 2C9.5 5.5 8.5 8.5 8.5 12C8.5 15.5 9.5 18.5 12 22"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.5"
      />
      {/* Horizontal parallel */}
      <ellipse cx="12" cy="12" rx="10.5" ry="4" stroke="currentColor" strokeWidth="1.2" opacity="0.35" />
      {/* Center point — the fix */}
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );

  if (variant === "mark") {
    return <span className={cn("inline-flex items-center text-fg", className)}>{mark}</span>;
  }

  return (
    <span className={cn("inline-flex items-center", s.gap, className)}>
      {variant === "full" && mark}
      <span className={cn("font-semibold tracking-tight text-fg", s.text)}>Meridian</span>
    </span>
  );
}
