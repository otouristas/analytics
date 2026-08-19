import { CHANNEL_BY_ID } from "@/lib/analytics/channels";
import { cn } from "@/lib/utils";

/** Local copies from svglogos.dev (gilbarbara/logos, CC0). */
const FILE: Record<string, string> = {
  google: "/channels/google.svg",
  bing: "/channels/bing.svg",
  duckduckgo: "/channels/duckduckgo.svg",
  yandex: "/channels/yandex.svg",
  apple: "/channels/apple.svg",
  "apple-ai": "/channels/apple.svg",
  chatgpt: "/channels/chatgpt.svg",
  grok: "/channels/grok.svg",
  perplexity: "/channels/perplexity.svg",
  claude: "/channels/claude.svg",
  gemini: "/channels/gemini.svg",
  copilot: "/channels/copilot.svg",
  "meta-ai": "/channels/meta.svg",
  x: "/channels/x.svg",
  twitter: "/channels/twitter.svg",
  linkedin: "/channels/linkedin.svg",
  youtube: "/channels/youtube.svg",
  reddit: "/channels/reddit.svg",
  instagram: "/channels/instagram.svg",
  tiktok: "/channels/tiktok.svg",
  threads: "/channels/threads.svg",
  bluesky: "/channels/bluesky.svg",
  whatsapp: "/channels/whatsapp.svg",
  slack: "/channels/slack.svg",
  email: "/channels/email.svg",
  gads: "/channels/gads.svg",
  meta: "/channels/meta.svg",
  xads: "/channels/x.svg",
  ph: "/channels/ph.svg",
  facebook: "/channels/facebook.svg",
  yahoo: "/channels/yahoo.svg",
  openai: "/channels/openai.svg",
};

const FALLBACK: Record<string, string> = {
  direct: "#97C7B4",
  referral: "#7A8A7A",
  newsletter: "#C4A574",
  hn: "#FF6600",
  baidu: "#2319DC",
};

export function ChannelLogo({
  id,
  size = "md",
  className,
}: {
  id: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const src = FILE[id];
  const box = size === "lg" ? "size-10" : size === "sm" ? "size-6" : "size-8";
  const name = CHANNEL_BY_ID[id]?.name ?? id;
  if (src) {
    return (
      <span
        className={cn(
          box,
          "inline-grid shrink-0 place-items-center overflow-hidden rounded-md bg-elevated p-1 shadow-[var(--shadow-border)]",
          className,
        )}
      >
        <img src={src} alt={name} className="size-full object-contain" />
      </span>
    );
  }
  return (
    <span
      className={cn(box, "inline-grid shrink-0 place-items-center rounded-md font-mono text-xs text-bg", className)}
      style={{ background: FALLBACK[id] ?? "#6B7280" }}
      title={name}
    >
      {(CHANNEL_BY_ID[id]?.mark ?? id.slice(0, 1)).slice(0, 2)}
    </span>
  );
}
