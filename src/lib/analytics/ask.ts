import { createServerFn } from "@tanstack/react-start";
import { analyticsSnapshot } from "./snapshot";
import type { RangeId } from "./model";

async function complete(prompt: string, system: string, maxTokens: number) {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return { ok: false as const, error: "AI is not available", text: "" };

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4.5",
      max_tokens: maxTokens,
      temperature: 0.35,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) return { ok: false as const, error: `xAI API error ${res.status}`, text: "" };
  const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return { ok: true as const, text: body.choices?.[0]?.message?.content ?? "", error: "" };
}

export const writeBrief = createServerFn({ method: "POST" })
  .validator((input: { range: RangeId }) => input)
  .handler(async ({ data }) => {
    const snap = analyticsSnapshot(data.range);
    const fallback = [
      `Revenue ${snap.revenue} on ${snap.users} actives (${(snap.growth * 100).toFixed(1)}% growth).`,
      `Grok and Perplexity are the highest-quality inbound. X is loud but converts below search.`,
      `${snap.lostIntent} live sample sessions never found the page they wanted — usually SSO, sources, or a choropleth demo.`,
      `Next: put a globe demo on /pricing, tag Grok/X as first-class sources, and write the missing SSO guide.`,
    ].join("\n\n");

    const result = await complete(
      JSON.stringify(snap),
      "You are the chief analyst for Meridian Analytics. Write a concise executive brief from the JSON snapshot. Four short paragraphs, no markdown headings, no bullets, no emoji. Cover: performance, channel mix (call out Grok, X, Google, ChatGPT), lost intent, and the single next move.",
      420,
    );
    return { ok: result.ok, error: result.error, text: result.text || fallback };
  });

export const writeLiveBrief = createServerFn({ method: "POST" })
  .validator((input: { snapshot: string }) => input)
  .handler(async ({ data }) => {
    const result = await complete(
      data.snapshot,
      "You are the live analyst for Discover Cyclades on Meridian. The JSON is real first-party traffic, not a demo. Write four short paragraphs: who is on the site right now, which countries and languages, which pages and sources matter, and one action for the team. No markdown headings, no bullets, no emoji. Never invent millions of users — only use the numbers given.",
      380,
    );
    if (!result.text) {
      return {
        ok: result.ok,
        error: result.error,
        text: "Live stream is too quiet to brief. Wait for a few more visitors, then try again.",
      };
    }
    return { ok: result.ok, error: result.error, text: result.text };
  });

export const askWorkspace = createServerFn({ method: "POST" })
  .validator((input: { range: RangeId; question: string; liveSnapshot?: string }) => input)
  .handler(async ({ data }) => {
    const snap = data.liveSnapshot || JSON.stringify(analyticsSnapshot(data.range));
    const result = await complete(
      `Question: ${data.question}\n\nSnapshot: ${snap}`,
      "You answer from Meridian live data when a live snapshot is present. Be specific. Never invent scale. Short paragraphs. No emoji.",
      380,
    );
    if (!result.ok && !result.text) {
      return {
        ok: false,
        error: result.error,
        text: "I can only answer from the current workspace snapshot. Try again in a moment.",
      };
    }
    return { ok: result.ok, error: result.error, text: result.text };
  });
