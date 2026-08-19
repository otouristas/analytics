import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared editorial building blocks, ported from the AnotherSEOGuru design
 * system: blue leads on actions, green carries the accent (eyebrows, ticks,
 * numerals, blooms).
 *
 * Marketing surfaces compose these rather than hand-rolling spacing and type —
 * that consistency is what makes the site read as one system. The authenticated
 * product deliberately does NOT use them: it has its own denser scale.
 */

/**
 * Decorative brand glow. Always pointer-events-none + aria-hidden.
 *
 * `signature` tints the glow with the surface's own `--signature-h` instead of
 * the fixed blue core, which is how a section gets its own light without
 * leaving the brand.
 *
 * IMPORTANT: a Bloom is large and usually offset beyond its container's edge,
 * so the positioned ancestor MUST carry `overflow-hidden`. Without it the glow
 * widens the document and the page scrolls horizontally on narrow viewports —
 * the decoration is invisible, but the sideways scroll is very visible.
 */
export function Bloom({
  className,
  soft = false,
  signature = false,
}: {
  className?: string;
  soft?: boolean;
  signature?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        signature ? "bloom-signature" : soft ? "bloom-soft" : "bloom",
        "pointer-events-none absolute",
        className,
      )}
    />
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("eyebrow", className)}>{children}</span>;
}

export function Section({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn("relative mx-auto w-full max-w-6xl px-6 py-20 md:py-28", className)}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  body?: ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="mt-4 font-display text-3xl font-medium leading-[1.06] tracking-[-0.03em] text-fg sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {body ? <p className="mt-4 text-base leading-relaxed text-muted">{body}</p> : null}
    </div>
  );
}

export function Panel({
  children,
  className,
  interactive = true,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div className={cn("panel p-6", interactive && "panel-interactive", className)}>{children}</div>
  );
}

/**
 * The hairline mesh: a grid whose 1px gaps expose the hairline background, so
 * cells are divided by rules without any borders on the cells themselves.
 * Children should carry `bg-surface`.
 */
export function MeshGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mesh-grid", className)}>{children}</div>;
}

/** Circle-check used for every feature bullet. */
export function Tick({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={cn("mt-[3px] size-4 shrink-0 text-brand", className)}
    >
      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeOpacity="0.35" />
      <path
        d="M4.8 8.3l2 2 4.4-4.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
