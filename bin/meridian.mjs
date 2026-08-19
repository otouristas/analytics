#!/usr/bin/env node
/**
 * Meridian Analytics CLI
 * Usage:
 *   node bin/meridian.mjs live [--key=mk_...]
 *   node bin/meridian.mjs who [--key=mk_...]
 *   node bin/meridian.mjs demand [--key=mk_...]
 *   node bin/meridian.mjs bots [--key=mk_...]
 */

const args = process.argv.slice(2);
const command = args[0] || "live";
const keyArg = args.find((a) => a.startsWith("--key="))?.split("=")[1] || process.env.MERIDIAN_KEY || "mk_cyclades";
const host = process.env.MERIDIAN_HOST || "http://127.0.0.1:8080";

async function main() {
  const url = `${host}/api/agent?key=${encodeURIComponent(keyArg)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`HTTP error: ${res.status}`);
      process.exit(1);
    }
    const data = await res.json();

    if (command === "live") {
      console.log(`\n🌌 Meridian Live Status · ${data.host}`);
      console.log(`Live Visitors: ${data.live}`);
      console.log(`Active Sessions: ${data.sessions}`);
      console.log(`Pageviews: ${data.pageviews}`);
      console.log(`Confirmed Revenue: €${((data.confirmedRevenueCents || 0) / 100).toFixed(2)}\n`);
    } else if (command === "who") {
      console.log(`\n👤 Live Visitors on ${data.host}:`);
      console.table(data.now || []);
    } else if (command === "demand") {
      console.log(`\n🏝 Destination Intent Demand:`);
      console.table(data.destinations || []);
    } else if (command === "bots") {
      console.log(`\n🤖 Bot Sentinel Breakdown:`);
      console.log(`Total Crawlers Isolated: ${data.botEventsCount}`);
      console.table(data.botTypes || []);
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error("Failed to connect to Meridian collector:", err.message);
    process.exit(1);
  }
}

main();
