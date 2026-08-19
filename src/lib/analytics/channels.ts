export type ChannelFamily = "search" | "ai" | "social" | "owned" | "paid" | "referral";

export type Channel = {
  id: string;
  name: string;
  mark: string;
  family: ChannelFamily;
  weight: number;
  quality: number;
  conversion: number;
  growth: number;
};

export const CHANNELS: Channel[] = [
  { id: "google", name: "Google", mark: "G", family: "search", weight: 22.4, quality: 0.82, conversion: 0.041, growth: 0.04 },
  { id: "bing", name: "Bing", mark: "B", family: "search", weight: 2.6, quality: 0.71, conversion: 0.033, growth: -0.04 },
  { id: "yahoo", name: "Yahoo", mark: "Y!", family: "search", weight: 0.8, quality: 0.58, conversion: 0.022, growth: -0.06 },
  { id: "duckduckgo", name: "DuckDuckGo", mark: "D", family: "search", weight: 1.1, quality: 0.76, conversion: 0.038, growth: 0.09 },
  { id: "baidu", name: "Baidu", mark: "Bd", family: "search", weight: 1.8, quality: 0.63, conversion: 0.027, growth: -0.02 },
  { id: "yandex", name: "Yandex", mark: "Ya", family: "search", weight: 0.7, quality: 0.66, conversion: 0.029, growth: 0.01 },
  { id: "apple", name: "Apple Search", mark: "Ap", family: "search", weight: 0.9, quality: 0.8, conversion: 0.048, growth: 0.07 },
  { id: "chatgpt", name: "ChatGPT", mark: "C", family: "ai", weight: 11.8, quality: 0.88, conversion: 0.062, growth: 0.38 },
  { id: "grok", name: "Grok", mark: "Gk", family: "ai", weight: 6.4, quality: 0.93, conversion: 0.079, growth: 0.86 },
  { id: "perplexity", name: "Perplexity", mark: "P", family: "ai", weight: 5.6, quality: 0.91, conversion: 0.071, growth: 0.51 },
  { id: "claude", name: "Claude", mark: "Cl", family: "ai", weight: 3.8, quality: 0.86, conversion: 0.058, growth: 0.36 },
  { id: "gemini", name: "Gemini", mark: "Ge", family: "ai", weight: 2.9, quality: 0.74, conversion: 0.036, growth: 0.2 },
  { id: "copilot", name: "Copilot", mark: "Co", family: "ai", weight: 1.7, quality: 0.69, conversion: 0.029, growth: 0.16 },
  { id: "meta-ai", name: "Meta AI", mark: "Ma", family: "ai", weight: 1.2, quality: 0.61, conversion: 0.021, growth: 0.28 },
  { id: "apple-ai", name: "Apple Intelligence", mark: "Ai", family: "ai", weight: 0.8, quality: 0.72, conversion: 0.034, growth: 0.44 },
  { id: "x", name: "X", mark: "X", family: "social", weight: 6.2, quality: 0.64, conversion: 0.028, growth: 0.24 },
  { id: "facebook", name: "Facebook", mark: "Fb", family: "social", weight: 2.4, quality: 0.5, conversion: 0.016, growth: -0.03 },
  { id: "linkedin", name: "LinkedIn", mark: "In", family: "social", weight: 3.9, quality: 0.79, conversion: 0.047, growth: 0.08 },
  { id: "youtube", name: "YouTube", mark: "Yt", family: "social", weight: 3.1, quality: 0.64, conversion: 0.022, growth: 0.15 },
  { id: "reddit", name: "Reddit", mark: "R", family: "social", weight: 2.2, quality: 0.61, conversion: 0.024, growth: 0.19 },
  { id: "instagram", name: "Instagram", mark: "Ig", family: "social", weight: 1.4, quality: 0.48, conversion: 0.014, growth: 0.06 },
  { id: "tiktok", name: "TikTok", mark: "Tt", family: "social", weight: 1.1, quality: 0.44, conversion: 0.011, growth: 0.17 },
  { id: "threads", name: "Threads", mark: "Th", family: "social", weight: 0.5, quality: 0.52, conversion: 0.016, growth: 0.21 },
  { id: "bluesky", name: "Bluesky", mark: "Bs", family: "social", weight: 0.4, quality: 0.58, conversion: 0.02, growth: 0.33 },
  { id: "whatsapp", name: "WhatsApp", mark: "Wa", family: "social", weight: 0.9, quality: 0.7, conversion: 0.039, growth: 0.12 },
  { id: "direct", name: "Direct", mark: "·", family: "owned", weight: 8.6, quality: 0.93, conversion: 0.084, growth: 0.03 },
  { id: "email", name: "Email", mark: "@", family: "owned", weight: 2.9, quality: 0.9, conversion: 0.091, growth: 0.02 },
  { id: "newsletter", name: "Newsletter", mark: "Nl", family: "owned", weight: 1.3, quality: 0.88, conversion: 0.076, growth: 0.09 },
  { id: "slack", name: "Slack", mark: "Sl", family: "owned", weight: 0.6, quality: 0.84, conversion: 0.067, growth: 0.11 },
  { id: "gads", name: "Google Ads", mark: "Ga", family: "paid", weight: 2.2, quality: 0.67, conversion: 0.044, growth: -0.07 },
  { id: "meta", name: "Meta Ads", mark: "M", family: "paid", weight: 1.1, quality: 0.52, conversion: 0.018, growth: -0.12 },
  { id: "xads", name: "X Ads", mark: "Xa", family: "paid", weight: 0.7, quality: 0.55, conversion: 0.023, growth: 0.18 },
  { id: "referral", name: "Referral", mark: "→", family: "referral", weight: 0.6, quality: 0.77, conversion: 0.053, growth: 0.05 },
  { id: "hn", name: "Hacker News", mark: "Hn", family: "referral", weight: 0.5, quality: 0.81, conversion: 0.049, growth: 0.14 },
  { id: "ph", name: "Product Hunt", mark: "Ph", family: "referral", weight: 0.4, quality: 0.73, conversion: 0.041, growth: 0.08 },
];

export const CHANNEL_BY_ID = Object.fromEntries(CHANNELS.map((c) => [c.id, c])) as Record<
  string,
  Channel
>;

export const FAMILIES: { id: ChannelFamily; label: string }[] = [
  { id: "search", label: "Search" },
  { id: "ai", label: "AI assistants" },
  { id: "social", label: "Social" },
  { id: "owned", label: "Owned" },
  { id: "paid", label: "Paid" },
  { id: "referral", label: "Referral" },
];

const TOTAL_WEIGHT = CHANNELS.reduce((sum, channel) => sum + channel.weight, 0);

export function channelShare(channel: Channel): number {
  return channel.weight / TOTAL_WEIGHT;
}

export function familyShare(family: ChannelFamily): number {
  return CHANNELS.filter((channel) => channel.family === family).reduce(
    (sum, channel) => sum + channelShare(channel),
    0,
  );
}

export function sessionsForChannel(channel: Channel, globalUsers: number): number {
  return globalUsers * channelShare(channel);
}

export function revenueForChannel(channel: Channel, globalRevenue: number): number {
  const qualityBoost = 0.55 + channel.quality * 0.9;
  return globalRevenue * channelShare(channel) * qualityBoost;
}

export function classifySource(raw: string, referrer = "", campaign = "") {
  const text = `${raw} ${referrer} ${campaign}`.toLowerCase();
  if (/gclid/.test(text) || (/google/.test(text) && /cpc|ppc|paid/.test(text))) return "gads";
  if (/fbclid/.test(text)) return "facebook";
  const rules: [RegExp, string][] = [
    [/grok|x\.ai/, "grok"],
    [/chatgpt|openai|chat\.openai/, "chatgpt"],
    [/perplexity/, "perplexity"],
    [/claude|anthropic/, "claude"],
    [/gemini|bard/, "gemini"],
    [/copilot/, "copilot"],
    [/\bx\.com\b|twitter\.com|\btwitter\b/, "x"],
    [/yahoo/, "yahoo"],
    [/bing/, "bing"],
    [/duckduckgo/, "duckduckgo"],
    [/yandex/, "yandex"],
    [/baidu/, "baidu"],
    [/linkedin/, "linkedin"],
    [/instagram/, "instagram"],
    [/facebook|fb\.com/, "facebook"],
    [/youtube/, "youtube"],
    [/reddit/, "reddit"],
    [/tiktok/, "tiktok"],
    [/threads\.net/, "threads"],
    [/bsky\.app|bluesky/, "bluesky"],
    [/whatsapp/, "whatsapp"],
    [/slack/, "slack"],
    [/producthunt|product.hunt/, "ph"],
    [/news\.ycombinator|hacker news/, "hn"],
    [/google/, "google"],
    [/apple/, "apple"],
  ];
  for (const [re, id] of rules) {
    if (re.test(text)) return id;
  }
  const key = raw.toLowerCase().trim();
  if (!key || key === "direct") return "direct";
  if (CHANNEL_BY_ID[key]) return key;
  return "referral";
}
