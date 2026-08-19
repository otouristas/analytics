import { cn } from "@/lib/utils";

const TONES = ["bg-map-2", "bg-map-3", "bg-map-4", "bg-map-5", "bg-elevated"] as const;

export function VisitorAvatar({
  initials,
  seed,
  live,
  size = "md",
}: {
  initials: string;
  seed: string;
  live?: boolean;
  size?: "sm" | "md";
}) {
  const tone = TONES[seed.charCodeAt(seed.length - 1) % TONES.length] ?? "bg-elevated";
  return (
    <span className="relative inline-flex shrink-0">
      <span
        className={cn(
          "grid place-items-center rounded-full font-mono text-fg",
          tone,
          size === "sm" ? "size-8 text-xs" : "size-10 text-sm",
        )}
      >
        {initials}
      </span>
      {live && (
        <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full bg-positive ring-2 ring-bg" />
      )}
    </span>
  );
}
