# Meridian Analytics CLI &amp; API Cookbook

Meridian provides an agentic REST endpoint at `/api/agent` and a lightweight CLI utility.

---

## Command Line Interface (CLI)

Run directly with `node`:

```bash
# Check live concurrent visitors
node bin/meridian.mjs live --key=mk_cyclades

# Inspect active visitor dossier
node bin/meridian.mjs who --key=mk_cyclades

# View destination intent demand breakdown
node bin/meridian.mjs demand --key=mk_cyclades

# Inspect bot and crawler isolation
node bin/meridian.mjs bots --key=mk_cyclades
```

---

## REST API Cookbook

### 1. General Property Snapshot
```bash
curl "https://analytics.discovercyclades.gr/api/agent?key=mk_cyclades"
```

### 2. Query Specific Metric
```bash
# Returns live user count
curl "https://analytics.discovercyclades.gr/api/agent?key=mk_cyclades&metric=live"

# Returns confirmed business revenue
curl "https://analytics.discovercyclades.gr/api/agent?key=mk_cyclades&metric=confirmed_revenue"
```

### 3. Query Specific Breakdown
```bash
# Top Inbound Traffic Sources
curl "https://analytics.discovercyclades.gr/api/agent?key=mk_cyclades&breakdown=sources"

# Destination Demand
curl "https://analytics.discovercyclades.gr/api/agent?key=mk_cyclades&breakdown=destinations"

# AI Crawlers & Bots
curl "https://analytics.discovercyclades.gr/api/agent?key=mk_cyclades&breakdown=bots"
```
