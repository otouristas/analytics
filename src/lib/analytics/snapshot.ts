import {
  CHANNELS,
  channelShare,
  familyShare,
  FAMILIES,
  revenueForChannel,
  sessionsForChannel,
} from "./channels";
import { computeTotals, COUNTRIES, rankedCountries } from "./countries";
import { formatMetric, type RangeId } from "./model";
import { lostSessions, SESSIONS } from "./sessions";

export function analyticsSnapshot(range: RangeId) {
  const world = computeTotals(COUNTRIES, range);
  return {
    range,
    revenue: formatMetric(world.revenue, "revenue"),
    users: formatMetric(world.users, "users"),
    growth: world.growth,
    conversion: world.conversion,
    arpu: formatMetric(world.arpu, "arpu"),
    topMarkets: rankedCountries("revenue", range)
      .slice(0, 8)
      .map((country) => ({
        name: country.name,
        revenue: formatMetric(country.revenue, "revenue"),
        users: formatMetric(country.users, "users"),
        growth: country.growth,
      })),
    families: FAMILIES.map((family) => ({
      id: family.id,
      label: family.label,
      share: familyShare(family.id),
    })),
    channels: CHANNELS.map((channel) => ({
      name: channel.name,
      family: channel.family,
      share: channelShare(channel),
      quality: channel.quality,
      conversion: channel.conversion,
      growth: channel.growth,
      sessions: Math.round(sessionsForChannel(channel, world.users)),
      revenue: formatMetric(revenueForChannel(channel, world.revenue), "revenue"),
    })),
    liveSample: SESSIONS.length,
    lostIntent: lostSessions().length,
  };
}
