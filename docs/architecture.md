# Meridian Analytics — Architecture

## What this is

Meridian is a **first-party, AI-native analytics platform**. It answers five questions: what happened, why, who caused it, what happens next, and what to do.

This repository is the **working Phase 1 product**, not a mock. Discover Cyclades (`discovercyclades.gr`) already sends real `page_view`, click, outbound, heartbeat, and exit events into the dashboard.

## Runtime (this codebase)

The App Builder workspace is **TanStack Start + Vite + React 19 + Tailwind v4**, not Next.js. That is the application layer we ship here. The public SDK and collector contracts are framework-agnostic so a future Next.js control plane can sit on the same APIs.

| Layer | Now | Target |
| --- | --- | --- |
| App / dashboard | TanStack Start | Same, or a Next.js control plane on the same APIs |
| Auth | Better Auth (Google, X, email) | Same + org RBAC |
| Application DB | Postgres (Neon in prod, PGLite in preview) | Same for tenants, keys, config |
| Event warehouse | Postgres `meridian_events` + in-memory ring for realtime | ClickHouse MergeTree + materialized rollups |
| Realtime | Poll `/api/live` and `/api/project-feed` every 2s | SSE / WebSocket counters, not full-table scans |
| AI | xAI `grok-4.5` over **computed snapshots**, never raw SQL | Semantic layer + tool-calling agent |
| Tracker | `/t.js` and `/meridian.js` | CDN `meridian.js` < 20KB gzip |

## Tenancy

```
User → Organization → Workspace → Property (website)
```

Phase 1 properties in this app:

| Property | Host | Write key |
| --- | --- | --- |
| Discover Cyclades | discovercyclades.gr | `mk_cyclades` |
| Meridian Demo | sandbox | `mk_live_demo` |

A request never reads another property’s events. Collector validates write key + (later) domain allowlist. Dashboard queries are always scoped by `property_id` / `write_key`.

## Data path

```
Website
  → meridian.js (beacon / fetch keepalive)
  → POST /api/collect   (edge-fast, validate, enqueue)
  → ring buffer (realtime)
  → Postgres meridian_events (Phase 1 warehouse)
  → [future] ClickHouse raw_events + daily_* rollups
  → Dashboard (Overview, Atlas, Live, Acquisition, Pages, Events)
  → Ask Meridian (snapshot JSON → Grok → narrative)
```

Ingestion **must not** run analytics queries. Collect returns `{ ok, id }` immediately.

## Product surfaces (Phase 1)

1. **Overview (Pulse)** — is the property healthy right now?
2. **Atlas** — Earth globe / flat map of live people
3. **Live** — unique sessions, avatars, path
4. **Acquisition** — channels (Google, Grok, ChatGPT, X, direct…)
5. **Pages** — landings, exits, titles
6. **Events** — kinds and counts
7. **Conversions** — marked events / outbound / booking paths
8. **Flow** — journeys
9. **Intent** — lost sessions + Grok reconstruction
10. **Ask Meridian** — natural language over the live snapshot
11. **Project** — install, verify, debug

## Non-negotiables

- No fabricated metrics on production properties.
- No unrestricted LLM SQL.
- No raw IPs in the UI.
- No fingerprinting.
- Consent-aware tracking on Discover Cyclades (loads only after Accept all).
- Fail open for analytics if AI is down.

## Why not ClickHouse in this slice

ClickHouse is the correct high-volume warehouse. This sandbox has Postgres (Neon/PGLite) only. Phase 1 stores events in Postgres with indexes on `(property_id, ts)` and a cap/TTL mindset. The schema in `docs/data-model.md` is written so a ClickHouse projection is a copy, not a redesign.
