# Meridian Analytics

First-party analytics for [discovercyclades.gr](https://discovercyclades.gr) — live globe, named goals, destination demand, and a canonical event layer. No fake revenue.

## Stack

TanStack Start · React 19 · Tailwind v4 · three.js globe · first-party `meridian.js` tracker.

## Run

```bash
npm install
npm run dev
```

Preview: `http://localhost:8080`

## Tracker

```html
<script defer data-meridian-id="mk_cyclades" data-host="https://YOUR_HOST" src="https://YOUR_HOST/meridian.js"></script>
```

Cookieless: add `data-cookieless="1"`.

## Agent API

`GET /api/agent?key=mk_cyclades` — JSON snapshot for Cursor / Claude.

Share: `/s/dc`

## Docs

See `/docs` for the Discover Cyclades event audit and implementation status.
