# Implementation status

## Phase 0 — Audit
Done. See `docs/meridian-event-audit.md`. Current master bridge is `app/meridian-tracker.tsx` → `/api/meridian`. No session-tracker.tsx. No nested `__pageview__` on master.

## Phase 1 — Normalize existing events
Done in Meridian: `src/lib/analytics/canonicalize.ts`.
- Preserves raw `kind`.
- Maps to canonical names.
- Unwraps nested payload **if** historical records appear.
- Derives `destinationId`, `contentType`, `partnerType` from path/href.

## Phase 2 — Typed schema
`IngestEvent` optional semantic fields. No destructive rewrite of `meridian_events`.

## Phase 3 — Missing high-value events
**Not instrumented on the Cyclades repo yet.** Proposed only: forward `phone_click`, `whatsapp_click`, `newsletter_signup` into `/api/meridian` with the same `sessionId`. Do not dual-send Meridian SDK.

## Phase 4 — Business metrics
Done, derived:
- `intentScore` 0–100 heuristic (`MODEL_KIND = HEURISTIC`)
- `qualified` score ≥ 20
- Destination Demand Index (explainable `why`)
- Channel quality (qualified rate, not volume)
- Landing quality
- Market × destination matrix

## Phase 5 — Funnels / journeys
Existing Journeys board + warehouse history. Destination funnel is Demand + Flow.

## Phase 6–11
GSC, postbacks, calibrated models: blocked on data. AI explains **metrics**, never invents them.

## Dual validation
Meridian still stores raw `kind`. Canonical is computed at read time. Heartbeats excluded from intent.
