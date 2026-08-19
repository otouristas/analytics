# Event schema

Canonical event (collector + warehouse). Extra fields are allowed in `properties` JSON; they never break ingestion.

```ts
interface MeridianEvent {
  eventId: string;
  propertyId: string;
  writeKey: string;
  eventName: string;          // page_view | click | outbound | heartbeat | exit | custom
  timestamp: string;          // ISO-8601
  sessionId: string;
  anonymousId?: string;
  userId?: string;            // only if identify() was called

  url?: string;
  host: string;
  path: string;
  title?: string;
  referrer?: string;
  fromPath?: string;
  href?: string;
  label?: string;

  source?: string;            // google | grok | chatgpt | x | direct | …
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
  query?: string;

  country?: string;           // ISO2, server-derived
  countryName?: string;
  region?: string;
  city?: string;              // only when privacy mode allows

  browser?: string;
  os?: string;
  device?: "desktop" | "mobile" | "tablet";
  language?: string;

  properties?: Record<string, unknown>;
}
```

## Automatic events (Phase 1)

| Name | When |
| --- | --- |
| `page_view` | First load + SPA history change |
| `heartbeat` | Every ~15s while visible |
| `click` | Internal click |
| `outbound` | Click leaving the host |
| `exit` | `pagehide` / `visibilitychange` hidden |

## Identity

- `sessionId` — first-party, ~30 min idle (localStorage key `meridian.sid`)
- No fingerprinting
- No raw IP stored; geo is derived at the edge and the IP is discarded

## Dedup

`eventId` is unique. Collector ignores a repeat id. Beacon retries are safe.

## Conversions (Phase 1 heuristic + config)

A conversion is an event matching a property rule. Until the UI editor ships, Discover Cyclades treats as conversion:

- path matching `/book`, `/checkout`, `/partner`
- `outbound` to a booking partner
- explicit `meridian.track("generate_lead" | "purchase" | …)`
