# Tracking SDK

## Install

```html
<script
  defer
  data-meridian-id="mk_cyclades"
  data-host="https://YOUR_MERIDIAN_ORIGIN"
  src="https://YOUR_MERIDIAN_ORIGIN/meridian.js">
</script>
```

Legacy alias (already on Discover Cyclades):

```html
<script defer data-key="mk_cyclades" data-host="…" src="…/t.js"></script>
```

Target: keep the script tiny, `defer`, `sendBeacon` with `fetch keepalive` fallback, no render-blocking CSS/fonts, no layout writes.

## JavaScript API

```js
meridian.page();
meridian.track("signup", { plan: "pro" });
meridian.identify("USER_ID", { accountType: "customer" });
meridian.revenue({ amount: 149, currency: "EUR", transactionId: "ABC123" });
meridian.consent({ analytics: true, marketing: false });
```

Before the script loads, a stub queue is installed:

```js
window.meridian = window.meridian || { q: [], track() { this.q.push(arguments); } };
```

## SPA

The script wraps `history.pushState` / `replaceState` and listens to `popstate`. Duplicate pageviews on the same path are suppressed.

## Privacy

- Strict: no localStorage, no cookies (session id in memory only)
- Balanced (default): first-party `meridian.sid`
- Consent: host site decides when to inject the script (Cyclades: after Accept all)

## What it never does

- Fingerprint canvas/audio/WebGL
- Read form field values
- Block LCP
- Talk to third-party analytics pixels
