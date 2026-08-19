# AI architecture

Meridian AI never invents numbers and never writes production SQL.

```
User question
  → assemble snapshot (metrics already computed in our code)
  → optional tool plan (getMetric, breakdown, detectAnomaly)
  → validated, tenant-scoped query
  → compact JSON result
  → Grok interprets the JSON
  → Answer / Evidence / Drivers / Confidence / Actions
```

## What is sent to the model

A **small structured snapshot**: live count, sessions, pageviews, top sources, top pages, devices, a handful of current visitors. Not the event log. Not PII beyond city/country already shown in the UI.

## Tools (Phase 3)

`getMetric` `comparePeriods` `breakdownMetric` `queryPages` `queryChannels` `queryEvents` `detectAnomalies`

The model proposes a tool; the server executes it with a property scope.

## Confidence language

- **Fact** — measured in the snapshot
- **Correlation** — dimension moved with the metric
- **Hypothesis** — needs a check

If the stream is too small, the model must say so.

## Cost

- No AI on page load
- Cache identical briefs per property for a few minutes
- `grok-4.5` for investigation; cheaper models later for classification
- If xAI is down, analytics UI still works
