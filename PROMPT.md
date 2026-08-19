# MERIDIAN — REMAINING WORK PROMPT

Hand this file to the agent continuing the work. It is written to be executed
top to bottom. Everything in it was verified against the repository and a live
headless browser on the date of the last commit below — it is not a wish list.

**Repo:** `github.com/otouristas/analytics` · branch `main`
**Stack:** TanStack Start + React 19 + Tailwind v4 + Supabase
**Dev:** `npm run dev` → http://localhost:8080

---

## 0. READ THIS FIRST — HOW TO WORK

The previous passes failed the user twice by *claiming* work was done without
looking at it. Do not repeat that.

### The verification protocol — mandatory for every change

1. **Look at the thing before you change it.** Screenshot it at 1440px and
   390px. Do not fix from reading source alone.
2. **Reproduce the defect.** State it concretely ("title truncates to
   'Qualifi…' because 7 cards share a 1440px row = 130px each"), not vaguely
   ("looks bad").
3. **Fix it.**
4. **Screenshot again and compare.** Confirm the specific defect is gone and
   nothing next to it broke.
5. **Run all three gates:** `npx tsc --noEmit` (0 errors) · `npm run lint`
   (0 errors; warnings are pre-existing, do not let the count rise) ·
   `npx vite build` (0 errors).
6. **Commit that module alone**, with a message naming the concrete defect and
   its cause.

### Headless browser harness

Playwright and Chromium are already installed. Use this pattern:

```js
import { chromium } from "./node_modules/playwright/index.mjs";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1440,height:2600}, deviceScaleFactor:1 });
const p = await ctx.newPage();
await p.goto("http://127.0.0.1:8080/app", { waitUntil:"networkidle" });
await p.waitForTimeout(1200);
// Desktop: sidebar is the FIRST <aside>. Mobile: click
// button[aria-label="Open sidebar"] first, then use the LAST <aside>.
await p.locator('aside').first().locator('button:has-text("Acquisition")').first().click();
await p.waitForTimeout(1800);
await p.screenshot({ path:"out.png" });
```

Two harness facts that will otherwise waste your time:

- **A tall viewport (2600px) is required to capture a board.** `fullPage:true`
  does nothing useful, because each board is an inner `overflow-y-auto`
  container, not the page.
- **Warm the dev server before measuring.** Vite's dep optimizer reloads on
  cold start and invalidates in-flight chunks, which produces phantom 504s and
  a "Failed to fetch dynamically imported module" error that is not a real bug.
  Hit every route once, wait ~8s, then measure.

### Overflow check — run on every board, both viewports

```js
await p.evaluate(() => {
  const de = document.documentElement;
  return { doc: [de.scrollWidth, de.clientWidth] }; // must be equal
});
```

Document-level overflow is a real bug. Inner-element reports for
`.pillar-shell` badge scrollers and the `animate-ping` live dot are expected
and intentional — do not "fix" those.

---

## 1. WHERE THINGS STAND

### Done — do not redo

| Area | State |
| --- | --- |
| Design tokens | AnotherSEOGuru oklch palette, dark-first (`:root` dark, `html.light` toggle) |
| Background patterns | `blueprint-grid`, `rule-sheet`, `dot-field`, `bloom`/`-soft`/`-signature`, `frame-halo`, `mesh-grid`, `gradient-text`, `rise-in` |
| `PillarHeader` | Marketing (centred + left) and product variants, in `src/components/ui/pillar-header.tsx` |
| Landing hero | Built on `PillarHeader`, matches anotherseoguru.com |
| Marketing navbar | Floating inset pill |
| Landing sections | problem-section, signal-chain, value-proof, use-cases, social-proof, feature-section, integrations-grid, pricing-section |
| Auth | Supabase Auth (Google OAuth w/ `webmasters.readonly` + email/password) |
| Data layer | `src/lib/supabase/` — client, typed schema, queries, hooks, gsc.ts |
| Search Console board | Import / Matching / Queries / Pages, live against the real Google account |
| Mobile dock | Floating iOS glass pill, `--dock-height` + `.dock-safe` |
| Boards rebuilt | **Overview, Acquisition, Journeys, Revenue** |

### Supabase — live and wired

Project `siwzszmukfbzicjjkxro`. 239,807 real GSC rows for `discovercyclades.gr`,
1,265 opportunities, 84 properties, 143 deployed edge functions.

Two migrations already applied: owner-scoped SELECT policies on
`gsc_search_analytics` / `gsc_sync_runs`, plus the `authenticated` SELECT
grants those policies needed to take effect. Both tables are read-only and
owner-scoped; `anon` is denied.

---

## 2. BLOCKERS — DO THESE FIRST (not code)

The deployed site cannot show real data until both are done. Vite inlines
`VITE_*` at **build time**, and `.env` is correctly gitignored.

1. **Vercel → Settings → Environment Variables**, then redeploy:
   ```
   VITE_SUPABASE_URL=https://siwzszmukfbzicjjkxro.supabase.co
   VITE_SUPABASE_ANON_KEY=<the anon key from local .env>
   ```
   Adding variables does not affect an existing build — it needs a fresh one.

2. **Supabase → Authentication → URL Configuration → Redirect URLs**: add the
   production domain. OAuth redirects to `${window.location.origin}/app`;
   without this Google bounces the callback.

Until both are set, `supabaseEnabled` is `false`: the app degrades to demo data
by design rather than white-screening.

---

## 3. PART A — APP MODULES (the bulk of the work)

**24 of the 35 board files still have no pillar header** and are visibly unfinished.
Work them in the priority order below, **one board per commit**.

### The recipe — apply to every board

1. Open with `<PropertyHeader>`: `eyebrow`, `title`, `subtitle`, and 4 `kpis`
   **computed from the data actually rendered below** (see §5 — this is where
   the real bugs live).
2. Wrap the scroll container in `dock-safe` so content clears the mobile dock.
3. Section headings: `kicker` + `heading-md`. Never a one-off face.
4. Cards: `border-hairline bg-surface`, `rounded-xl`. Not `border-border`.
5. Tables: `.data-table` inside `overflow-x-auto rounded-xl border border-hairline`.
6. Grids: `grid-cols-2` → `sm:grid-cols-3` → `lg:grid-cols-4`. **Never more
   than 4 across** — 7 truncated every title on Overview.
7. Every list must be **bounded** with an explicit "N more" note. Journeys
   rendered 77 rows, 65 of them valued 1.
8. Empty states via `<EmptyState>`, never a blank panel.

### Priority order

**Tier 1 — the brief calls these out, and they are the most used**

| # | Board | File | Lines | What it needs |
| --- | --- | --- | --- | --- |
| 1 | Ask Meridian | `query-board.tsx` | 210 | The brief's §50/§16 centrepiece. Needs: large composer, suggested prompts, and answers structured as **Answer → Evidence → Drivers → Confidence → Recommended action → Data sources**. Must not read as a chatbot bolted into a dashboard. Has hardcoded deltas — remove. |
| 2 | Goals / Conversions | `goals-board.tsx` | 49 | Nearly empty. Needs KPI row (conversions, rate, qualified conversion, revenue, rev/session), trend chart, and a conversion-definitions table (name, type, count, rate, revenue, status). |
| 3 | Pages | `pages-board.tsx` | 73 | Needs the full page table: path, sessions, qualified %, conversions, revenue, entry/exit, trend. |
| 4 | Events | `events-board.tsx` | 95 | Needs event catalogue table + volume trend. |
| 5 | Root Cause | `cause-board.tsx` | 65 | Brief §14: a metric, then its animated decomposition into contributing segments, then the explanation. Currently a stub. |

**Tier 2 — structurally incomplete**

| # | Board | File | Lines |
| --- | --- | --- | --- |
| 6 | Performance | `device-board.tsx` | 58 |
| 7 | Engagement | `engagement-board.tsx` | 53 |
| 8 | Funnels | `funnel-board.tsx` | 61 |
| 9 | Cohorts | `cohort-board.tsx` | 59 |
| 10 | Segments | `segment-board.tsx` | 78 |
| 11 | Campaigns | `campaign-board.tsx` | 230 |
| 12 | Attribution | `attribution-board.tsx` | 167 |
| 13 | Reports | `report-board.tsx` | 201 |

**Tier 3 — smaller surfaces**

`alert-board` (39), `debug-board` (27), `share-board` (70), `widgets-board`
(86), `lab-board` (88), `paths-board` (103), `notes-board` (134),
`intent-board` (120), `demand-board` (146), `forecast-board` (134),
`live-board` (194), `install-board` (266).

---

## 4. PART B — LANDING SECTIONS STILL MISSING

Present: hero, social-proof, problem-section, signal-chain, feature-section,
value-proof, use-cases, integrations-grid, pricing-section, final CTA, footer.

Missing, per the original brief:

1. **Root cause (§14)** — "Don't ask what happened. Ask why." A headline metric
   (`-21.4%`) decomposing into contributors (Santorini pages −9.7%, Mobile
   Safari −5.1%, UK traffic −3.8%, Other −2.8%) with the AI explanation.
2. **Search Console (§15)** — the rich table: page, clicks, impressions,
   position, qualified sessions, conversions, revenue, opportunity indicator.
3. **Ask Meridian (§16)** — the AI workspace shown as an interface excerpt:
   prompt → visible tool steps → structured answer with confidence.
4. **Customer journeys (§17)** — the funnel with real drop-off numbers
   (13,241 → 8,420 → 4,917 → 2,108 → 721).
5. **Reporting (§21)** — report types and "today's biggest opportunity".
6. **Security / trust (§22)** — tenant isolation, encryption, permissions,
   audit logs, GDPR. Restrained; no badge clutter.

**Rules:** real-looking interface excerpts, never illustrations or stock
graphics. Compose from `Section`, `SectionHeading`, `MeshGrid`, `Panel`,
`Bloom`, `Tick` in `src/components/ui/primitives.tsx`.

**A `Bloom` requires `overflow-hidden` on its positioned ancestor.** Without it
the glow widens the document and the whole page scrolls sideways on mobile.
This has already bitten once.

---

## 5. PART C — CROSS-CUTTING (do alongside, not last)

### 5.1 Fabricated numbers — highest-value cleanup

Three boards still carry hardcoded deltas: `overview-board.tsx`,
`query-board.tsx`, `seo-board.tsx` (`grep -rE 'delta: "\+[0-9]'`).

**The rule: a number on screen must come from the data, or say that it doesn't.**
Two real bugs of this class were already found and fixed — treat them as the
pattern to hunt:

- **Revenue** showed "€0 confirmed" beside "2,184 orders" above a table
  totalling €599. Cause: `?? fallback` does **not** fire on a real `0`, while
  `|| fallback` does. Mixing the two across sibling metrics guarantees they
  disagree.
- **Acquisition** reported 97.7% of traffic as qualified, because it summed the
  sessions of every channel that had at least one conversion. Qualified is a
  property of a *session*.

Where a metric genuinely is not tracked (qualified sessions, conversions and
revenue do **not** exist in the Supabase schema — they come from Meridian's own
tracker), render `—` and say what would populate it. Never derive a
plausible-looking substitute.

### 5.2 Token migration

30 board files still use `border-border`. Migrate to `border-hairline` for
surfaces and dividers. `border-border` stays valid for input/control chrome.

### 5.3 Tablet (768–1024px)

Currently just inherits the desktop grid. The brief asks for a rethought
hierarchy. Audit every board at 834×1112 and add `md:` rules where a
two-column desktop layout should stack or reflow.

### 5.4 Light theme

Every board must be checked in light mode — `localStorage.setItem("meridian-theme","light")`
plus `document.documentElement.classList.add("light")`. Both themes are
first-class; light is not an inversion.

---

## 6. KNOWN BUG PATTERNS — CHECK FOR THESE EVERY TIME

Each was found in this codebase. They recur.

| Pattern | Symptom | Fix |
| --- | --- | --- |
| `last:` on an only child | Every divider missing — `last:border-0` matches all of them, since each child is the last child of its own wrapper | Drive off the index |
| Fixed-size SVG in a smaller slot | Sparkline overflowing its card | Size to container; `overflow-hidden` on the slot |
| `Bloom` in an unclipped parent | Horizontal page scroll on mobile | `overflow-hidden` on the positioned ancestor |
| `?? fallback` on a numeric metric | Real `0` shows as a mock value, or two metrics disagree | Pick one operator per group of related metrics |
| Unbounded `.map()` over a long tail | 60+ rows all valued 1 | Slice + "N more" note |
| Text sharing a row with a badge | Unbreakable word clipped mid-letter | Give text the full width; move the badge |
| Ternary as a statement | ESLint `no-unused-expressions` **error** | `if/else` |
| `interface` in a Supabase `Database` type | Every insert rejected as `never` | Use `type` aliases — interfaces get no implicit index signature |

---

## 7. DEFINITION OF DONE, PER MODULE

- [ ] Opens with a pillar header whose KPIs derive from the rendered data
- [ ] No truncated labels at 390, 834 or 1440
- [ ] No document-level horizontal overflow at any of the three
- [ ] Every list bounded with an explicit remainder note
- [ ] Empty, loading and error states present
- [ ] Correct in light **and** dark
- [ ] Zero fabricated numbers, or they are labelled as sample
- [ ] `tsc` 0 · `lint` 0 errors · `build` 0 errors
- [ ] Before/after screenshots compared at 1440 and 390
- [ ] Committed alone, message naming the defect and its cause
