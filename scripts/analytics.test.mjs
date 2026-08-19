import assert from "node:assert/strict";
import test from "node:test";
import { generateForecast } from "../src/lib/analytics/forecast.ts";
import { classifyBot } from "../src/lib/analytics/bot-classifier.ts";
import { isExcluded, addExclusion, getDroppedCount } from "../src/lib/analytics/exclusions.ts";
import { createNote } from "../src/lib/analytics/notes.ts";
import { getIntegrationsList, updateIntegrationStatus, getIntegration } from "../src/lib/analytics/integrations.ts";

test("Forecast generates Holt-Winters smoothed trend and confidence bounds", () => {
  const history = [10, 12, 15, 14, 18, 22, 25, 29, 34, 38, 42, 45, 50];
  const report = generateForecast(history, 7, [], "Daily Active Users");

  assert.equal(report.projections.length, 7);
  assert.ok(report.growthRatePct > 0);
  assert.equal(report.trend, "accelerating");
  assert.ok(report.projections[0].upperBound >= report.projections[0].forecast);
  assert.ok(report.projections[0].lowerBound <= report.projections[0].forecast);
  assert.ok(report.summary.includes("accelerating"));
});

test("Bot classifier identifies AI scrapers and indexers from User-Agent", () => {
  assert.equal(classifyBot("Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)").botType, "GPTBot");
  assert.equal(classifyBot("Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)").botType, "ClaudeBot");
  assert.equal(classifyBot("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36").isBot, false);
});

test("Exclusions engine correctly drops matched wildcard paths and IP addresses", () => {
  addExclusion("/preview/*", "path");
  assert.equal(isExcluded("/preview/123", "1.1.1.1"), true);
  assert.equal(isExcluded("/en/islands/paros", "1.1.1.1"), false);
});

test("Integrations registry tracks provider states", () => {
  const list = getIntegrationsList();
  assert.ok(list.length >= 8);
  updateIntegrationStatus("stripe", "connected");
  const stripe = getIntegration("stripe");
  assert.equal(stripe?.status, "connected");
});
