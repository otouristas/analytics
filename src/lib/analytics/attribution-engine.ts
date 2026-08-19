import { CHANNEL_BY_ID } from "./channels";
import type { LivePerson } from "./realtime";
import { isConversionEvent } from "./ingest";

export type AttributionModelType = "first_touch" | "last_touch" | "linear" | "position_based" | "markov";

export type ChannelAttributionResult = {
  channelId: string;
  channelName: string;
  firstTouchShare: number;
  lastTouchShare: number;
  linearShare: number;
  positionShare: number;
  markovShare: number;
  conversions: number;
  assistedConversions: number;
  efficiencyIndex: number; // >1 means higher ROI under multi-touch than last-touch
};

export type AttributionReport = {
  totalConversions: number;
  totalJourneys: number;
  channels: ChannelAttributionResult[];
  models: {
    first_touch: Record<string, number>;
    last_touch: Record<string, number>;
    linear: Record<string, number>;
    position_based: Record<string, number>;
    markov: Record<string, number>;
  };
};

/**
 * Computes multi-touch attribution across all available models including Markov chain removal effect.
 */
export function computeAttribution(people: LivePerson[]): AttributionReport {
  const convertedPeople = people.filter((p) => p.converted || p.events.some(isConversionEvent));
  const totalConversions = Math.max(1, convertedPeople.length);

  const firstTouchMap = new Map<string, number>();
  const lastTouchMap = new Map<string, number>();
  const linearMap = new Map<string, number>();
  const positionMap = new Map<string, number>();
  const assistedMap = new Map<string, number>();
  const allChannels = new Set<string>();

  // Extract journeys: sequences of touchpoint channels
  const journeys: string[][] = [];

  for (const person of people) {
    const touchpoints: string[] = [];
    for (const e of person.events) {
      const ch = e.source || "direct";
      allChannels.add(ch);
      if (touchpoints[touchpoints.length - 1] !== ch) {
        touchpoints.push(ch);
      }
    }
    if (!touchpoints.length && person.source) {
      touchpoints.push(person.source);
      allChannels.add(person.source);
    }
    if (touchpoints.length) {
      journeys.push(touchpoints);
    }

    if (person.converted || person.events.some(isConversionEvent)) {
      const n = touchpoints.length;
      if (n === 0) continue;

      // 1. First Touch
      const first = touchpoints[0]!;
      firstTouchMap.set(first, (firstTouchMap.get(first) ?? 0) + 1);

      // 2. Last Touch
      const last = touchpoints[n - 1]!;
      lastTouchMap.set(last, (lastTouchMap.get(last) ?? 0) + 1);

      // 3. Linear
      const creditPerPoint = 1 / n;
      for (const ch of touchpoints) {
        linearMap.set(ch, (linearMap.get(ch) ?? 0) + creditPerPoint);
      }

      // 4. Position-based (40% first, 40% last, 20% middle)
      if (n === 1) {
        positionMap.set(first, (positionMap.get(first) ?? 0) + 1);
      } else if (n === 2) {
        positionMap.set(first, (positionMap.get(first) ?? 0) + 0.5);
        positionMap.set(last, (positionMap.get(last) ?? 0) + 0.5);
      } else {
        positionMap.set(first, (positionMap.get(first) ?? 0) + 0.4);
        positionMap.set(last, (positionMap.get(last) ?? 0) + 0.4);
        const middleCredit = 0.2 / (n - 2);
        for (let i = 1; i < n - 1; i++) {
          const mid = touchpoints[i]!;
          positionMap.set(mid, (positionMap.get(mid) ?? 0) + middleCredit);
        }
      }

      // Assisted conversions (channels present in touchpoints other than the last)
      const uniqueAssists = new Set(touchpoints.slice(0, -1));
      for (const ch of uniqueAssists) {
        assistedMap.set(ch, (assistedMap.get(ch) ?? 0) + 1);
      }
    }
  }

  // 5. Markov Chain Removal Effect Attribution
  const markovMap = computeMarkovRemovalEffect(people, [...allChannels]);

  const channelResults: ChannelAttributionResult[] = [...allChannels].map((ch) => {
    const firstVal = firstTouchMap.get(ch) ?? 0;
    const lastVal = lastTouchMap.get(ch) ?? 0;
    const linearVal = linearMap.get(ch) ?? 0;
    const posVal = positionMap.get(ch) ?? 0;
    const markovVal = markovMap.get(ch) ?? 0;
    const assists = assistedMap.get(ch) ?? 0;

    const firstShare = firstVal / totalConversions;
    const lastShare = lastVal / totalConversions;
    const linearShare = linearVal / totalConversions;
    const positionShare = posVal / totalConversions;
    const markovShare = markovVal / Math.max(1, totalConversions);

    // Efficiency index: How much more credit multi-touch gives compared to last-touch
    const efficiency = lastShare > 0 ? (linearShare + markovShare) / (2 * lastShare) : linearShare > 0 ? 1.5 : 1.0;

    return {
      channelId: ch,
      channelName: CHANNEL_BY_ID[ch]?.name ?? ch,
      firstTouchShare: firstShare,
      lastTouchShare: lastShare,
      linearShare: linearShare,
      positionShare: positionShare,
      markovShare: markovShare,
      conversions: lastVal,
      assistedConversions: assists,
      efficiencyIndex: Math.round(efficiency * 100) / 100,
    };
  });

  return {
    totalConversions: convertedPeople.length,
    totalJourneys: journeys.length,
    channels: channelResults.sort((a, b) => b.linearShare - a.linearShare),
    models: {
      first_touch: Object.fromEntries(firstTouchMap),
      last_touch: Object.fromEntries(lastTouchMap),
      linear: Object.fromEntries(linearMap),
      position_based: Object.fromEntries(positionMap),
      markov: Object.fromEntries(markovMap),
    },
  };
}

/**
 * Simplified Markov Chain state-transition removal effect algorithm.
 */
function computeMarkovRemovalEffect(people: LivePerson[], channels: string[]): Map<string, number> {
  const removalCredits = new Map<string, number>();
  if (!channels.length) return removalCredits;

  const totalConverted = people.filter((p) => p.converted || p.events.some(isConversionEvent)).length;
  if (totalConverted === 0) {
    for (const ch of channels) removalCredits.set(ch, 0);
    return removalCredits;
  }

  // Base conversion probability
  const baseRate = totalConverted / Math.max(1, people.length);

  // Compute conversion rate with each channel removed
  const removalEffects: { channel: string; effect: number }[] = [];

  for (const ch of channels) {
    const remainingPeople = people.filter((p) => {
      const touchpoints = p.events.map((e) => e.source || "direct");
      return !touchpoints.includes(ch) && p.source !== ch;
    });

    const remainingConverted = remainingPeople.filter((p) => p.converted || p.events.some(isConversionEvent)).length;
    const remainingRate = remainingPeople.length > 0 ? remainingConverted / remainingPeople.length : 0;
    const effect = Math.max(0, baseRate - remainingRate);
    removalEffects.push({ channel: ch, effect });
  }

  const totalEffect = removalEffects.reduce((sum, item) => sum + item.effect, 0);
  for (const item of removalEffects) {
    const weight = totalEffect > 0 ? item.effect / totalEffect : 1 / channels.length;
    removalCredits.set(item.channel, weight * totalConverted);
  }

  return removalCredits;
}
