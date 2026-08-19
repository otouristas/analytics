import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "thin" | "default" | "strong" | "pill";
  className?: string;
}

/**
 * GlassPanel — strictly for mobile navigation dock, floating controls,
 * bottom sheets, modal overlays, and the AI composer.
 * Data tables, charts, and content surfaces stay solid for maximum legibility.
 */
export function GlassPanel({
  children,
  variant = "default",
  className,
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        "glass",
        variant === "thin" && "glass-thin",
        variant === "strong" && "glass-strong",
        variant === "pill" && "glass-pill",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
