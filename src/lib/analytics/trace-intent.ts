import { createServerFn } from "@tanstack/react-start";
import { CHANNEL_BY_ID } from "./channels";
import { pageByPath, type LiveSession } from "./sessions";

export type IntentTrace = {
  serp: string;
  lookingFor: string;
  gap: string;
  nextDestination: string;
  confidence: number;
};

export type TraceInput = {
  name: string;
  countryName: string;
  city: string;
  channelId: string;
  query: string;
  pages: string[];
  dwellSec: number;
  found: boolean;
  converted: boolean;
  nextGuess: string;
};

function fallbackTrace(input: TraceInput): IntentTrace {
  const channel = CHANNEL_BY_ID[input.channelId]?.name ?? "Unknown";
  const last = pageByPath(input.pages[input.pages.length - 1] ?? "/");
  return {
    serp:
      channel === "Google" || channel === "Bing" || channel === "DuckDuckGo"
        ? `Results 1–3 for “${input.query}” likely mixed product pages with GA4 how-tos. Meridian sat beside Mixpanel and a docs thread.`
        : `Inside ${channel}, the answer cited Meridian as a revenue-map alternative, then listed pricing and a comparison to GA4.`,
    lookingFor: input.query,
    gap: input.found
      ? `They reached ${last.title} and lingered ${input.dwellSec}s — intent mostly matched.`
      : `They bounced through ${input.pages.join(" → ")} without the answer. The page they needed is probably a source-quality or SSO guide, not ${last.title}.`,
    nextDestination: input.nextGuess,
    confidence: input.found ? 0.71 : 0.64,
  };
}

export const traceIntent = createServerFn({ method: "POST" })
  .validator((input: TraceInput) => input)
  .handler(async ({ data }): Promise<{ ok: true; trace: IntentTrace } | { ok: false; error: string; trace: IntentTrace }> => {
    const local = fallbackTrace(data);
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return { ok: false, error: "AI is not available", trace: local };
    }

    const channel = CHANNEL_BY_ID[data.channelId]?.name ?? data.channelId;
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 420,
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "You reconstruct web journeys for an analytics product called Meridian Analytics. Reply with JSON only, no markdown. Shape: {\"serp\": string, \"lookingFor\": string, \"gap\": string, \"nextDestination\": string, \"confidence\": number}. Be concrete. serp = what they likely saw in Google/Bing or an AI chat before clicking. gap = why they did or did not find it. nextDestination = the next site or query if unsatisfied. confidence is 0-1.",
          },
          {
            role: "user",
            content: JSON.stringify({
              visitor: data.name,
              place: `${data.city}, ${data.countryName}`,
              source: channel,
              query: data.query,
              path: data.pages,
              dwellSec: data.dwellSec,
              found: data.found,
              converted: data.converted,
              hintedNext: data.nextGuess,
            }),
          },
        ],
      }),
    });

    if (!res.ok) {
      return { ok: false, error: `xAI API error ${res.status}`, trace: local };
    }

    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = body.choices?.[0]?.message?.content ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return { ok: true, trace: local };

    try {
      const parsed = JSON.parse(match[0]) as Partial<IntentTrace>;
      return {
        ok: true,
        trace: {
          serp: String(parsed.serp ?? local.serp),
          lookingFor: String(parsed.lookingFor ?? local.lookingFor),
          gap: String(parsed.gap ?? local.gap),
          nextDestination: String(parsed.nextDestination ?? local.nextDestination),
          confidence: Math.min(1, Math.max(0, Number(parsed.confidence ?? local.confidence))),
        },
      };
    } catch {
      return { ok: true, trace: local };
    }
  });

export function sessionToTraceInput(session: LiveSession): TraceInput {
  return {
    name: session.name,
    countryName: session.countryName,
    city: session.city,
    channelId: session.channelId,
    query: session.query,
    pages: session.pages,
    dwellSec: session.dwellSec,
    found: session.found,
    converted: session.converted,
    nextGuess: session.nextGuess,
  };
}
