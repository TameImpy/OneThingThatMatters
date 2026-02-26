# One Thing That Matters — Claude Instructions

## Project Overview

Editorial dashboard for a daily AI newsletter. The editor opens `/today`, reviews content pulled from 5 n8n-populated Supabase tables, picks one item per category, previews the newsletter live, then publishes via Resend to all subscribers.

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 18, TypeScript 5
- **Database:** Supabase (PostgreSQL) via `@supabase/supabase-js` 2.39.0
- **Styling:** Tailwind CSS v4 — CSS-first config via `app/globals.css` + `@theme` (no `tailwind.config.ts`)
- **Email:** Resend for transactional email delivery
- **Runtime:** Node 20+, npm

## Available Skills

The following skills are available via the Skill tool (invoke with `/skill-name`):

- **keybindings-help** — Customize keyboard shortcuts, rebind keys, add chord bindings, or modify `~/.claude/keybindings.json`.
- **claude-developer-platform** — Build applications using the Anthropic SDK (`anthropic` / `@anthropic-ai/sdk`) or Claude API. Use when code imports the Anthropic SDK or explicitly targets the Claude API.
- **design-spec** — Analyse design mockups, screenshots, or described designs to extract a comprehensive design system document (colours, typography, spacing, components, layout, design tokens) for handoff to a coding agent.
