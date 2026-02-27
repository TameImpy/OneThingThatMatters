# One Thing That Matters — Implementation Status

Last updated: February 2026

---

## What's Built

### Infrastructure
- [x] Next.js 15 App Router project with TypeScript strict mode
- [x] Tailwind CSS v4 with CSS-first config (`app/globals.css` + `@theme`), custom navy colour tokens
- [x] Supabase client in `lib/supabase.ts` — service role key, server-side only
- [x] All TypeScript interfaces in `lib/types.ts` — 8 interfaces, zero `any`
- [x] `migrations/new_tables.sql` — creates `subscribers` and `newsletter_issues` tables

### Content API Layer (5 tables)
- [x] `GET /api/today/watch` — `watch_candidates` filtered by `updated_at` (day range, isTimestamp=true)
- [x] `GET /api/today/news` — `ai_news_top5` filtered by `run_date`
- [x] `GET /api/today/research` — `ai_paper_candidates` filtered by `run_date`
- [x] `GET /api/today/story` — `stories_of_past_candidates` filtered by `newsletter_date`
- [x] `GET /api/today/art` — `newsletter_daily_art` filtered by `issue_date`, returns single item
- [x] All routes accept optional `?date=YYYY-MM-DD` query param

### Pick System
- [x] `POST /api/pick` — marks item as picked/selected in the appropriate table
- [x] `pickItem()` in `lib/supabase.ts` handles `selected` (stories) vs `picked + picked_at` (all others)
- [x] Optimistic UI updates with revert on failure

### Quote Generation
- [x] `POST /api/newsletter/quotes` — OpenAI GPT-4o-mini generates 5 contextual quotes
- [x] Editor selects one quote on `/today`
- [x] Selected quote persisted in sessionStorage as `quote-{date}`

### Issue Numbering
- [x] `GET /api/newsletter/issue-count` — counts weekdays since `NEWSLETTER_START_DATE`
- [x] Result displayed in newsletter preview and email

### Editorial Dashboard (`/today`)
- [x] Fetches and displays candidates for all 5 categories
- [x] Pick buttons with optimistic updates
- [x] Quote generation and selection UI
- [x] Art confirmation (stored in sessionStorage as `art-{date}`)
- [x] "Preview Newsletter" link navigates to `/newsletter/[date]`

### Newsletter Preview (`/newsletter/[date]`)
- [x] Reads picks from DB for 4 content categories
- [x] Reads quote from sessionStorage (`quote-{date}`)
- [x] Reads art confirmation from sessionStorage (`art-{date}`)
- [x] Live rendered email preview via `NewsletterPreview` component
- [x] Publish button with loading state

### Publishing
- [x] `POST /api/newsletter/publish` — validates picks, sends via Resend, saves `newsletter_issues` row
- [x] `renderNewsletterHTML()` in `lib/resend.ts` — full email template
- [x] Subscriber count returned and displayed after publish

### Subscriber System
- [x] `POST /api/subscribe` — insert or reactivate subscriber
- [x] `DELETE /api/subscribe` — deactivate subscriber
- [x] `app/subscribe/page.tsx` — public subscribe form
- [x] `app/unsubscribe/page.tsx` — reads `?email=` param, deactivates
- [x] Unsubscribe link in every email footer (uses `NEXT_PUBLIC_APP_URL`)

### Reusable Components
- [x] `CandidateCard.tsx` — score badge, pick button, card layout
- [x] `CategorySection.tsx` — labelled section wrapper
- [x] `NewsletterPreview.tsx` — live HTML preview panel

---

## Known Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| `isTimestamp=true` for Watch | `watch_candidates.updated_at` is `timestamptz`, not `date`. Day-range filter avoids Postgres cast issues. |
| sessionStorage for quote + art | Picks must survive navigation from `/today` → `/newsletter/[date]` without a DB round-trip. sessionStorage is cleared on browser close, which is fine — the editor completes the flow in one session. |
| `selected` on stories table | `stories_of_past_candidates` was created by n8n with a different schema. `pickItem()` in `lib/supabase.ts` branches on table name to handle this. |
| Weekday issue numbering | The newsletter publishes Mon–Fri only. Counting weekdays gives a consecutive issue number that skips weekends. |
| OpenAI for quotes | The quote generation prompt benefits from GPT-4o-mini's broad historical knowledge. Uses `OPEN_AI_KEY` env var (not `OPENAI_API_KEY`). |
| No auth layer | Internal tool for a single editor. Adding auth would add complexity with zero security benefit for this use case. |
| Service key server-side only | All DB mutations go through API routes. The browser never holds the service role key. |

---

## Remaining / Future Work

### Must-Do Before Production
- [ ] Run `migrations/new_tables.sql` in Supabase SQL editor (creates `subscribers` + `newsletter_issues`)
- [ ] Populate all env vars in production environment (see `FULL_PROJECT_PRD.md` §10)
- [ ] Verify Resend sender domain is verified in Resend dashboard
- [ ] Confirm `NEWSLETTER_START_DATE` is set to the actual first publish date

### Nice to Have
- [ ] Error boundary / fallback UI if Supabase returns 0 items for a category
- [ ] Toast notifications for pick success/failure (currently silent reverts)
- [ ] Ability to un-pick an item and pick a different one
- [ ] Archive page — view past `newsletter_issues` records
- [ ] Subscriber management UI (view count, recent subscribes/unsubscribes)
- [ ] Preview the email in a real email client before publishing (litmus-style)
- [ ] POV / editorial note field in the email (placeholder exists in newsletter page)

### Explicitly Out of Scope
- Multi-user access / login
- Mobile-responsive editorial dashboard (desktop-only tool)
- Content ingestion (owned by n8n pipelines)
- Fit score tuning (owned by n8n / LLM pipelines)

---

## Testing Checklist (Run Before Each Publish)

Use this checklist to verify the full flow works end-to-end each weekday morning:

- [ ] Open `/today` — all 5 category sections load without errors
- [ ] Each section shows at least 1 candidate (confirms n8n ran overnight)
- [ ] Pick one item in each of the 4 pickable categories (Watch, Read, Research, Story)
- [ ] Art section shows today's image
- [ ] Click "Generate Quotes" — 5 quotes appear within a few seconds
- [ ] Select one quote — it highlights as selected
- [ ] Click "Preview Newsletter" — navigates to `/newsletter/[date]`
- [ ] Preview renders correctly: art image loads, quote appears, all 4 content sections populated
- [ ] Issue number in preview matches expected weekday count
- [ ] Click "Publish" — spinner appears, success message shows subscriber count
- [ ] Check email inbox — confirm email arrived, all links work, unsubscribe link is correct
- [ ] Verify `newsletter_issues` row was inserted in Supabase
