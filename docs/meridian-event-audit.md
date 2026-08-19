# Meridian × Discover Cyclades — event audit

Audited `otouristas/nextjscyclades` **master** `42d492fa` (2026-08-19).

Historical note: `__pageview__` + nested `properties.payload` / `inside_click` → `area_badge_click` is **not** on current master. The live Meridian bridge is a flat `kind` field.

## Data flow (current)

```
Browser
  ├─ MeridianTracker  → POST /api/meridian → Supabase meridian_events.payload
  │                     GET  /api/meridian  → Meridian /api/project-feed
  └─ AnalyticsRouteTracker → gtag only (GA4). Not forwarded to Meridian.
```

Session ID: `localStorage["meridian.sid"]` (`EXISTING`). Heartbeat every 15s. Geo from `x-vercel-ip-country` / city headers.

## Inventory

| Status | Source | Raw name | Trigger | Destination | Session | Visitor | Meaning | Funnel | Canonical |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EXISTING | `app/meridian-tracker.tsx` | `pageview` | load + pushState + popstate | Meridian | yes | no separate visitor_id | page seen | Exposure | `page_view` |
| EXISTING | same | `click` | internal `<a>` | Meridian | yes | no | in-site link | Exploration | `internal_click` or `destination_select` if island in path/label |
| EXISTING | same | `outbound` | off-site `<a>` | Meridian | yes | no | left for partner/other | Commercial | `partner_outbound_click` |
| EXISTING | same | `heartbeat` | 15s while visible | Meridian | yes | no | infrastructure | — | `heartbeat` (excluded from business counts) |
| EXISTING | same | `exit` | pagehide | Meridian | yes | no | session/page end | — | `session_end` |
| EXISTING | `app/analytics-route-tracker.tsx` | `page_view` | SPA nav | **GA4 only** | GA | GA | duplicate journey in GA | Exposure | n/a until forwarded |
| EXISTING | same | `page_exit` | nav / hide | **GA4 only** | GA | GA | dwell + scroll | — | n/a |
| EXISTING | same | `click` / `click_outbound` | delegated | **GA4 only** | GA | GA | richer link context | Exploration | n/a |
| EXISTING | `src/lib/analytics/engagement.ts` | `phone_click` | tel: | **GA4** (+ partner supabase) | GA | — | call | Commercial | `phone_click` **PROPOSED** on Meridian |
| EXISTING | same | `whatsapp_click` | wa.me | GA4 | GA | — | WhatsApp | Commercial | `whatsapp_click` **PROPOSED** |
| EXISTING | same | `email_click` | mailto: | GA4 | GA | — | email | Commercial | `email_click` **PROPOSED** |
| EXISTING | same | `partner_website_click` | partner data-* | GA4 + supabase partner events | — | — | partner site | Commercial | already `outbound` on Meridian if same click |
| EXISTING | `src/lib/analytics/newsletter.ts` | `newsletter_signup` | form success | **GA4 only** | — | — | lead | Confirmed | `lead_submit` **PROPOSED** |
| EXISTING | partner apply | `partner_lead` | `/api/partners/apply` | GA4 | — | — | B2B lead | Confirmed | `lead_submit` **PROPOSED** |
| NOT ON MASTER | — | `__pageview__` | historical | — | — | — | nested payload | — | normalizer still unwraps if seen |
| NOT ON MASTER | — | `inside_click` | historical | — | — | — | nested `area_badge_click` | Destination | `destination_select` if nested type present |
| NOT ON MASTER | — | `session-tracker.tsx` | — | — | — | — | not in tree | — | do not invent |

## Problems

1. Meridian kinds are technical (`click`) not business (`destination_select`).
2. No `visitor_id` distinct from session.
3. No destination/partner IDs on the Meridian payload — **derived from path/href**.
4. GA4 has richer engagement that never reaches Meridian.
5. Heartbeats must not count as activity (enforced in intent model).
6. Dual trackers (GA4 + Meridian) — different event IDs, not double-counted in Meridian.

## Metrics already calculable (no new pixels)

sessions, page_views, bounce, avg duration, outbound, destination demand (from path), market×island, channel quality, landing quality, intent score, qualified session rate.

## Blocked without new events

Confirmed revenue, GSC join, phone/WhatsApp **in Meridian** (they exist only in GA4), newsletter as Meridian lead, area_badge as first-class destination_select (homepage badges are currently generic `click` unless path/label contains the island).
