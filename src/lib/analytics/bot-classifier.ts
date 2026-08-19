export type BotType =
  | "human"
  | "GPTBot"
  | "ClaudeBot"
  | "PerplexityBot"
  | "Googlebot"
  | "GoogleOther"
  | "Applebot"
  | "Bingbot"
  | "Bytespider"
  | "CCBot"
  | "suspected";

export type BotClassification = {
  isBot: boolean;
  botType: BotType;
  category: "human" | "ai_crawler" | "search_indexer" | "generic_bot";
  name: string;
};

export const classifyBot = classifyUserAgent;

export function classifyUserAgent(ua?: string | null): BotClassification {
  if (!ua) {
    return { isBot: false, botType: "human", category: "human", name: "Human Visitor" };
  }

  const s = ua.toLowerCase();

  // AI Crawlers
  if (s.includes("gptbot") || s.includes("chatgpt-user") || s.includes("oai-searchbot")) {
    return { isBot: true, botType: "GPTBot", category: "ai_crawler", name: "OpenAI GPTBot" };
  }
  if (s.includes("claudebot") || s.includes("anthropic-ai")) {
    return { isBot: true, botType: "ClaudeBot", category: "ai_crawler", name: "Anthropic ClaudeBot" };
  }
  if (s.includes("perplexitybot") || s.includes("perplexity")) {
    return { isBot: true, botType: "PerplexityBot", category: "ai_crawler", name: "Perplexity AI Crawler" };
  }
  if (s.includes("bytespider") || s.includes("bytedance")) {
    return { isBot: true, botType: "Bytespider", category: "ai_crawler", name: "ByteDance ByteSpider" };
  }
  if (s.includes("ccbot") || s.includes("commoncrawl")) {
    return { isBot: true, botType: "CCBot", category: "ai_crawler", name: "Common Crawl Bot" };
  }

  // Search Indexers
  if (s.includes("googleother")) {
    return { isBot: true, botType: "GoogleOther", category: "search_indexer", name: "GoogleOther System" };
  }
  if (s.includes("googlebot")) {
    return { isBot: true, botType: "Googlebot", category: "search_indexer", name: "Googlebot" };
  }
  if (s.includes("applebot")) {
    return { isBot: true, botType: "Applebot", category: "search_indexer", name: "Applebot" };
  }
  if (s.includes("bingbot") || s.includes("msnbot")) {
    return { isBot: true, botType: "Bingbot", category: "search_indexer", name: "Microsoft Bingbot" };
  }

  // Generic crawler / headless scraper indicators
  if (
    s.includes("spider") ||
    s.includes("crawler") ||
    s.includes("headlesschrome") ||
    s.includes("phantomjs") ||
    s.includes("python-requests") ||
    s.includes("aiohttp") ||
    s.includes("curl/") ||
    s.includes("wget/") ||
    s.includes("semrushbot") ||
    s.includes("ahrefsbot") ||
    s.includes("yandexbot") ||
    s.includes("duckduckbot")
  ) {
    return { isBot: true, botType: "suspected", category: "generic_bot", name: "Automated Web Crawler" };
  }

  return { isBot: false, botType: "human", category: "human", name: "Human Visitor" };
}
