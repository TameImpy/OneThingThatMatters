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
