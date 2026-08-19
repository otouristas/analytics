# Data model

## Postgres (application + Phase 1 events)

See `migrations/0002_meridian.sql`.

- `organizations`, `organization_members` — tenant
- `properties` — website, write key, timezone, currency
- `meridian_events` — Phase 1 event store (indexed by property + time)
- `conversion_definitions` — named rules
- `ai_threads` / `ai_messages` — copilot history (property-scoped)

Auth tables remain in `0001_auth.sql` (Better Auth — do not edit).

## ClickHouse (target warehouse)

Not provisioned in this sandbox. Planned tables:

| Table | Engine | ORDER BY |
| --- | --- | --- |
| `raw_events` | MergeTree | (property_id, event_date, event_name, timestamp) |
| `sessions` | AggregatingMergeTree | (property_id, session_date, session_id) |
| `daily_property_metrics` | SummingMergeTree | (property_id, day) |
| `daily_page_metrics` | SummingMergeTree | (property_id, day, path) |
| `daily_channel_metrics` | SummingMergeTree | (property_id, day, source, medium) |

Partition by month. LowCardinality on source, device, country. TTL from property retention.

## Query rule

Dashboards hit **rollups** or the last-N realtime buffer. They do not scan unbounded raw events on every poll.

Phase 1: the live feed is the last ~300–800 events per property (Cyclades collector cap + client merge). Overview/Pages/Events compute from that stream. Postgres persistence is for durability and debug, not full-history GA4 replacement — that is ClickHouse.
