# Privacy and security

## Privacy

- First-party collector only
- No fingerprinting
- IP used at most for geo/bot, never stored, never shown
- City is best-effort and optional
- Consent mode: site injects the script only after analytics consent (Cyclades cookie `all`)
- Do not capture passwords, payment fields, or form values
- Session replay / heatmaps are **out of the core script** (Phase 5, separate bundle)

## Security

- Write keys validated on collect
- Server keys never shipped to the client
- Tenant isolation on every query (`property_id` / `write_key`)
- RBAC planned: Owner, Admin, Analyst, Marketer, Viewer, Client
- Auth via Better Auth; preview uses the platform session
- Rate-limit collect (later); CORS is open for beacon origins, authorization is the key
- CSP on the dashboard; tracker does not eval strings from the page

## Data retention

Phase 1: live ring + Postgres rows. Configurable TTL is a property setting (3 / 6 / 12 / 24 months) once ClickHouse ships. Deletion: drop property events by `property_id`.
