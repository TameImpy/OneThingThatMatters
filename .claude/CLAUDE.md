# One Thing That Matters — Claude Instructions

## Project Overview

Editorial dashboard for a daily AI newsletter. The editor opens `/today`, reviews content pulled from 5 n8n-populated Supabase tables, picks one item per category (plus a quote), previews the newsletter live, then publishes via Resend to all subscribers.

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 18, TypeScript 5
- **Database:** Supabase (PostgreSQL) via `@supabase/supabase-js` 2.39.0
- **Styling:** Tailwind CSS v4 — CSS-first config via `app/globals.css` + `@theme` (no `tailwind.config.ts`)
- **Email:** Resend for transactional email delivery
- **AI:** OpenAI SDK (`openai`) for quote generation via GPT-4o-mini — uses `OPEN_AI_KEY` env var (not Anthropic)
- **Runtime:** Node 20+, npm

## Available Skills

The following skills are available via the Skill tool (invoke with `/skill-name`):

- **keybindings-help** — Customize keyboard shortcuts, rebind keys, add chord bindings, or modify `~/.claude/keybindings.json`.
- **claude-developer-platform** — Build applications using the Anthropic SDK (`anthropic` / `@anthropic-ai/sdk`) or Claude API. Use when code imports the Anthropic SDK or explicitly targets the Claude API.
- **design-spec** — Analyse design mockups, screenshots, or described designs to extract a comprehensive design system document (colours, typography, spacing, components, layout, design tokens) for handoff to a coding agent.

## Key Files

- `lib/types.ts` — 8 interfaces: WatchCandidate, AiNewsTop5, AiPaperCandidate, StoryOfPastCandidate, NewsletterDailyArt, DailyQuote, Subscriber, NewsletterIssue + helper types (CategoryTable, PickRequest, TodayPicks, PublishRequest)
- `lib/supabase.ts` — Supabase client, `getTodayItems()` (supports isTimestamp flag), `pickItem()`, `getActiveSubscribers()`
- `lib/resend.ts` — Resend client + `renderNewsletterHTML()` email template
- `app/today/page.tsx` — Main editorial dashboard (client component)
- `app/newsletter/[date]/page.tsx` — Full-page preview + Publish button; reads sessionStorage for quote + art picks
- `app/subscribe/page.tsx` — Public subscribe form
- `app/unsubscribe/page.tsx` — Unsubscribe page (reads ?email= param)
- `components/CandidateCard.tsx` — Pick card with score badge, pick button
- `components/CategorySection.tsx` — Section wrapper with label
- `components/NewsletterPreview.tsx` — Live email preview panel
- `migrations/new_tables.sql` — SQL for `subscribers` + `newsletter_issues` tables

## API Routes

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/today/watch` | `watch_candidates` filtered to today via `updated_at` (isTimestamp=true) |
| GET | `/api/today/news` | `ai_news_top5` filtered to today via `run_date` |
| GET | `/api/today/research` | `ai_paper_candidates` filtered to today via `run_date` |
| GET | `/api/today/story` | `stories_of_past_candidates` filtered to today via `newsletter_date` |
| GET | `/api/today/art` | `newsletter_daily_art` for today via `issue_date`, returns single item |
| POST | `/api/pick` | `{ table, id }` → sets picked/selected on the row |
| POST | `/api/newsletter/quotes` | `{ watch, news, research, story }` → returns 5 quotes from OpenAI GPT-4o-mini |
| GET | `/api/newsletter/issue-count` | `?date=YYYY-MM-DD` → returns `{ issueNumber }` (weekday count since `NEWSLETTER_START_DATE`) |
| POST | `/api/newsletter/publish` | Sends Resend batch email + saves `newsletter_issues` row |
| POST | `/api/subscribe` | Insert/reactivate subscriber |
| DELETE | `/api/subscribe` | Deactivate subscriber (unsubscribe) |

All `GET /api/today/*` routes accept an optional `?date=YYYY-MM-DD` query param.

## The 5 Content Tables

| Category | Table | Date column | Filter type | Pick field |
|----------|-------|-------------|-------------|------------|
| Watch | `watch_candidates` | `updated_at` | timestamp (`isTimestamp=true`) | `picked`, `picked_at` |
| Read | `ai_news_top5` | `run_date` | date | `picked`, `picked_at` |
| Research | `ai_paper_candidates` | `run_date` | date | `picked`, `picked_at` |
| Story | `stories_of_past_candidates` | `newsletter_date` | date | `selected` only (no `picked_at`); has `echo_today` field |
| Art | `newsletter_daily_art` | `issue_date` | date | No DB pick field — user confirms via sessionStorage key `art-{date}` |

## SessionStorage Keys

Two keys persist picks when navigating `/today` → `/newsletter/[date]`:

- `quote-{date}` — JSON-serialised `DailyQuote` object chosen by the editor
- `art-{date}` — any truthy string; its presence signals art has been confirmed by the editor

## Issue Numbering

`GET /api/newsletter/issue-count` counts **weekdays** (Mon–Fri) from `NEWSLETTER_START_DATE` to the requested date (inclusive). The result is used as the newsletter issue number displayed in the email.

## Quote Generation

`POST /api/newsletter/quotes` calls **OpenAI GPT-4o-mini** via the `openai` npm package. The env var is `OPEN_AI_KEY` (not `OPENAI_API_KEY`). The route takes today's 4 picks as context and returns 5 historically accurate quotes. The editor picks one; the choice is stored in sessionStorage under `quote-{date}`.

## Architecture Decisions

- **`isTimestamp` flag** — `watch_candidates.updated_at` is a `timestamptz`, not a `date`. `getTodayItems()` applies a day-range filter (`>= T00:00:00Z`, `< T23:59:59Z`) when `isTimestamp=true` to avoid Postgres cast issues.
- **sessionStorage pattern** — Quote and art picks are stored client-side so they survive navigation between `/today` and `/newsletter/[date]` without a DB round-trip.
- **Service role key server-side only** — `SUPABASE_SERVICE_KEY` is used exclusively in API routes and `lib/supabase.ts`. Never passed to client components.
- **Stories table uses `selected`** — Unlike the other four tables that use `picked` + `picked_at`, `stories_of_past_candidates` uses only `selected: boolean`. `pickItem()` in `lib/supabase.ts` handles this distinction.
- **Weekday issue counting** — Issues are numbered by counting Mon–Fri days since `NEWSLETTER_START_DATE` (skipping weekends). Logic lives in `/api/newsletter/issue-count/route.ts`.
- **Full TypeScript, zero `any` types.**

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `SUPABASE_URL` | yes | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | yes | Service role key — server-side DB access only |
| `RESEND_API_KEY` | yes | Resend key for sending email |
| `OPEN_AI_KEY` | yes | OpenAI key for GPT-4o-mini quote generation |
| `NEWSLETTER_START_DATE` | yes | `YYYY-MM-DD` of first issue; basis for issue number calculation |
| `NEXT_PUBLIC_APP_URL` | yes | Base URL inserted into unsubscribe links in emails |

## Colour System

- `navy-950` (#0B0F1A) — main background (custom, defined in `app/globals.css`)
- `navy-900` (#111827) — card backgrounds (custom)
- `navy-800` (#1E2A3A) — borders, dividers (custom)
- `cyan-400` (#22D3EE) — primary accent (built-in Tailwind)
- `cyan-100` (#CFFAFE) — body text (built-in Tailwind)
- `amber-400` (#FBBF24) — score badges (built-in Tailwind)
