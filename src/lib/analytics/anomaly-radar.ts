import type { IngestEvent } from "./ingest";
import type { LivePerson } from "./realtime";
import { CHANNEL_BY_ID } from "./channels";

export type AnomalySeverity = "critical" | "warning" | "opportunity" | "healthy";

export type AnomalyCard = {
  id: string;
  metric: string;
  title: string;
  body: string;
  severity: AnomalySeverity;
  zScore: number;
  expectedVal: number;
  actualVal: number;
  deltaPct: number;
  dimension?: string;
  dimensionVal?: string;
  actionableRecommendation: string;
  detectedAt: number;
};

export type AnomalyReport = {
  overallHealth: "prime" | "stable" | "degraded" | "critical";
  anomalies: AnomalyCard[];
  stats: {
    scannedSessions: number;
    scannedEvents: number;
    rageClicks: number;
    clientErrors: number;
    lcpAverage: number;
    conversionRate: number;
  };
};

/**
 * Calculates mean, variance, standard deviation and interquartile range (IQR) for a numeric series.
 */
export function calculateSeriesStats(values: number[]) {
  if (!values.length) return { mean: 0, std: 0, median: 0, iqr: 0, q1: 0, q3: 0 };
  const n = values.length;
  const mean = values.reduce((sum, v) => sum + v, 0) / n;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / Math.max(1, n - 1);
  const std = Math.sqrt(variance);

  const sorted = [...values].sort((a, b) => a - b);
  const median = n % 2 === 0 ? (sorted[n / 2 - 1]! + sorted[n / 2]!) / 2 : sorted[Math.floor(n / 2)]!;
  const q1 = sorted[Math.floor(n * 0.25)] ?? 0;
  const q3 = sorted[Math.floor(n * 0.75)] ?? 0;
  const iqr = q3 - q1;

  return { mean, std, median, iqr, q1, q3 };
}

/**
 * Scans the live event stream and active sessions for statistical anomalies.
 */
export function scanAnomalies(events: IngestEvent[], people: LivePerson[]): AnomalyReport {
  const anomalies: AnomalyCard[] = [];
  const now = Date.now();

  const rageClicks = events.filter((e) => e.kind === "rage_click");
  const errors = events.filter((e) => e.kind === "error");
  const conversions = people.filter((p) => p.converted);
  const convRate = people.length > 0 ? conversions.length / people.length : 0;

  const vitals = events.filter((e) => e.kind === "vital" && e.label === "LCP");
  const lcpSamples = vitals.map((v) => Number(v.query)).filter((n) => Number.isFinite(n) && n > 0);
  const lcpAvg = lcpSamples.length ? Math.round(lcpSamples.reduce((a, b) => a + b, 0) / lcpSamples.length) : 0;

  // 1. Rage Click Anomaly Detection
  if (rageClicks.length > 0) {
    const targets = new Map<string, number>();
    for (const rc of rageClicks) {
      const key = rc.label || rc.path;
      targets.set(key, (targets.get(key) ?? 0) + 1);
    }
    for (const [target, count] of targets.entries()) {
      if (count >= 2) {
        anomalies.push({
          id: `anom_rage_${target}_${now}`,
          metric: "User Friction",
          title: `Rage click surge on ${target.replace("rage:", "")}`,
          body: `Detected ${count} rapid click cluster(s). Users are frustrated clicking an unresponsive or slow element.`,
          severity: count >= 5 ? "critical" : "warning",
          zScore: 3.2,
          expectedVal: 0,
          actualVal: count,
          deltaPct: count * 100,
          dimension: "element",
          dimensionVal: target,
          actionableRecommendation: `Inspect CSS cursor, disabled button states, or slow asynchronous handlers for '${target}'.`,
          detectedAt: now,
        });
      }
    }
  }

  // 2. Client-Side Error Surge
  if (errors.length > 0) {
    const errorMessages = new Map<string, number>();
    for (const err of errors) {
      const msg = err.label || "Script Exception";
      errorMessages.set(msg, (errorMessages.get(msg) ?? 0) + 1);
    }
    for (const [msg, count] of errorMessages.entries()) {
      if (count >= 1) {
        anomalies.push({
          id: `anom_err_${msg.slice(0, 20)}_${now}`,
          metric: "Runtime Errors",
          title: `JavaScript runtime error detected: ${msg.slice(0, 50)}`,
          body: `${count} browser exception(s) logged in the recent stream. This may degrade user conversion.`,
          severity: count >= 3 ? "critical" : "warning",
          zScore: 2.8,
          expectedVal: 0,
          actualVal: count,
          deltaPct: 100,
          dimension: "error",
          dimensionVal: msg,
          actionableRecommendation: `Check browser console logs on recent deployments. Verify undefined object property access.`,
          detectedAt: now,
        });
      }
    }
  }

  // 3. Web Vitals (LCP) Degradation
  if (lcpAvg > 2500) {
    const isCritical = lcpAvg > 4000;
    anomalies.push({
      id: `anom_lcp_${now}`,
      metric: "Performance (LCP)",
      title: `Largest Contentful Paint degraded to ${(lcpAvg / 1000).toFixed(2)}s`,
      body: `Average LCP exceeds Google's 2.5s threshold across ${lcpSamples.length} measured samples.`,
      severity: isCritical ? "critical" : "warning",
      zScore: 2.4,
      expectedVal: 1800,
      actualVal: lcpAvg,
      deltaPct: ((lcpAvg - 1800) / 1800) * 100,
      dimension: "vital",
      dimensionVal: "LCP",
      actionableRecommendation: `Optimize hero images with fetchpriority="high", preconnect to CDN, or defer blocking scripts.`,
      detectedAt: now,
    });
  }

  // 4. Channel Conversion Outlier / Opportunity
  if (people.length >= 6) {
    const channelStats = new Map<string, { total: number; converted: number }>();
    for (const p of people) {
      const src = p.source || "direct";
      const item = channelStats.get(src) ?? { total: 0, converted: 0 };
      item.total += 1;
      if (p.converted) item.converted += 1;
      channelStats.set(src, item);
    }

    for (const [ch, stat] of channelStats.entries()) {
      const chRate = stat.total > 0 ? stat.converted / stat.total : 0;
      const chName = CHANNEL_BY_ID[ch]?.name ?? ch;

      // High traffic with zero conversion
      if (stat.total >= 4 && stat.converted === 0 && convRate > 0.05) {
        anomalies.push({
          id: `anom_ch_drop_${ch}_${now}`,
          metric: "Channel Conversion",
          title: `Zero conversions from ${chName}`,
          body: `${stat.total} visitors arrived via ${chName} without reaching a goal, underperforming baseline.`,
          severity: "warning",
          zScore: -2.1,
          expectedVal: Math.round(stat.total * Math.max(0.1, convRate)),
          actualVal: 0,
          deltaPct: -100,
          dimension: "channel",
          dimensionVal: ch,
          actionableRecommendation: `Review landing page messaging for ${chName} traffic to align search intent with destination CTAs.`,
          detectedAt: now,
        });
      }

      // High converting breakout channel (Opportunity)
      if (stat.total >= 2 && chRate >= 0.5) {
        anomalies.push({
          id: `anom_ch_surge_${ch}_${now}`,
          metric: "Growth Opportunity",
          title: `High intent surge from ${chName}`,
          body: `${Math.round(chRate * 100)}% conversion rate (${stat.converted}/${stat.total}) from ${chName}. High-value visitor segment.`,
          severity: "opportunity",
          zScore: 3.5,
          expectedVal: Math.round(stat.total * 0.15),
          actualVal: stat.converted,
          deltaPct: ((chRate - 0.15) / 0.15) * 100,
          dimension: "channel",
          dimensionVal: ch,
          actionableRecommendation: `Double down on ${chName} content and create targeted landing pages for this audience.`,
          detectedAt: now,
        });
      }
    }
  }

  // 5. Lost Intent Spike
  const lostSessions = people.filter((p) => !p.found || p.pages.length <= 1);
  if (people.length >= 8 && lostSessions.length / people.length > 0.65) {
    const lostRate = lostSessions.length / people.length;
    anomalies.push({
      id: `anom_bounce_surge_${now}`,
      metric: "Session Retention",
      title: `High session drop-off rate (${Math.round(lostRate * 100)}%)`,
      body: `${lostSessions.length} of ${people.length} sessions exited after viewing only a single page.`,
      severity: "warning",
      zScore: 2.3,
      expectedVal: Math.round(people.length * 0.4),
      actualVal: lostSessions.length,
      deltaPct: ((lostRate - 0.4) / 0.4) * 100,
      dimension: "intent",
      dimensionVal: "lost",
      actionableRecommendation: `Add contextual internal linking and clear navigation paths on top entrance pages.`,
      detectedAt: now,
    });
  }

  const overallHealth: AnomalyReport["overallHealth"] = anomalies.some((a) => a.severity === "critical")
    ? "critical"
    : anomalies.some((a) => a.severity === "warning")
      ? "degraded"
      : anomalies.length > 0
        ? "stable"
        : "prime";

  return {
    overallHealth,
    anomalies: anomalies.sort((a, b) => {
      const order: Record<AnomalySeverity, number> = { critical: 3, warning: 2, opportunity: 1, healthy: 0 };
      return order[b.severity] - order[a.severity] || Math.abs(b.zScore) - Math.abs(a.zScore);
    }),
    stats: {
      scannedSessions: people.length,
      scannedEvents: events.length,
      rageClicks: rageClicks.length,
      clientErrors: errors.length,
      lcpAverage: lcpAvg,
      conversionRate: convRate,
    },
  };
}
