# Lessons Learned

A running log of non-obvious bugs, gotchas, and decisions made on this project. Each entry should record what went wrong, why, and how it was fixed — so future-you (or a teammate) can benefit without needing the full conversation context.

---

## 2026-05-27 — Picked video changes between `/today` and `/newsletter/[date]`

**What went wrong:** Editor picked a video on `/today`, but the publish page rendered a different (older) video as the WATCH item.

**Why:** Two compounding issues:
1. `pickItem` in `lib/supabase.ts` set `picked=true` on the new row but never cleared prior picks. Over time, `watch_candidates` accumulated multiple `picked=true` rows.
2. `/today` queried watch candidates with `daysBack=7`, but `/newsletter/[date]` used the default `daysBack=1`. With multiple picks in the table, each page's `.find(w => w.picked)` on a `fit_score`-sorted list could land on a different row depending on which were inside its window.

**Fix:**
- `pickItem` now atomically clears other `picked=true` (or `selected=true` for stories) rows before setting the new pick. One pick per category.
- `/newsletter/[date]` now sends `&daysBack=7` to `/api/today/watch` to match `/today`'s window.

**Lesson:** When a "current selection" is represented by a boolean flag on multiple rows, the write path must enforce single-selection — otherwise readers will disagree about "the selection" whenever they apply different filters. Either enforce uniqueness on write, or treat the most recently updated row as canonical (sort by timestamp, not by some other field).

---

## 2026-05-29 — Double opt-in confirmation link silently consumed by email security scanners

**What went wrong:** Some subscribers couldn't complete the double opt-in flow. Symptoms varied: some saw "link expired/invalid" on a fresh email, others got the link after a second sign-up attempt. The newsletter itself sent fine to confirmed subscribers, so it wasn't a delivery problem.

**Why:** The confirmation link was a `GET /api/subscribe/confirm?token=...` that *mutated state* — it set `active=true` and nulled the one-time token. Corporate email security (Outlook Safe Links, Mimecast, Proofpoint, etc.) and some inboxes **pre-fetch URLs in emails** to scan for malware. A scanner GET on the link silently consumed the token *before the human ever clicked*; the human then landed on "link invalid" even though they were actually already confirmed in the database. Re-subscribing helped because the new token sometimes evaded the scanner long enough for the human to click first.

**Fix:** Switched to the scanner-safe POST pattern.
- Email link now points at the confirmation **page** (`/subscribe/confirm?token=...`), not the API. The page is a safe, idempotent GET that doesn't mutate anything — scanners can fetch it freely.
- The user clicks a "Confirm subscription" button on that page, which **POSTs** the token to `/api/subscribe/confirm`. Scanners don't do POST, so they can't accidentally activate or burn the token.
- The POST handler is idempotent: already-confirmed → success ("already" status, no duplicate welcome email); invalid token → 404 status with friendly message.
- The old `GET /api/subscribe/confirm?token=...` route now redirects to the page instead of mutating, so emails already in the wild still work.

**Lesson:** Never mutate state on a `GET` reached via a link in an email. Assume any URL in an email will be fetched by an automated scanner before the recipient sees it. Put state-changing actions behind a `POST` (or other non-GET method) triggered by an explicit user gesture on a landing page.
