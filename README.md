# One Thing That Matters

**Agent-Assisted Daily Newsletter System**

A modern newsletter workflow system that surfaces high-quality Watch, Listen, and Read content through AI-assisted curation and editorial oversight.

---

## 🎯 Project Status

**Current Milestone:** Milestone 1 - Backend Foundation ✅ **COMPLETE**

**Build Status:** ✅ Passing
**Last Updated:** 2025-12-09

---

## 📋 Quick Links

- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Current status, setup instructions, testing guide
- **[FULL_PROJECT_PRD.md](./FULL_PROJECT_PRD.md)** - Complete product requirements
- **[FULL_PROJECT_TASKS.md](./FULL_PROJECT_TASKS.md)** - All milestone tasks
- **[MILESTONE_1_COMPLETE.md](./MILESTONE_1_COMPLETE.md)** - Milestone 1 implementation details

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy and update `.env` with your Supabase credentials:
```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

Get credentials from: [Supabase Dashboard](https://app.supabase.com) → Settings → API

### 3. Run Database Migration
If you have an existing database, run the migration in Supabase SQL Editor:
```sql
-- Execute migrations/add_ingested_at.sql
```

### 4. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Milestone 2)                   │
│                    Next.js + React + UI                      │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                   Backend API (Milestone 1) ✅               │
│                                                              │
│  GET  /api/watch/shortlist  - Fetch candidates              │
│  POST /api/watch/select     - Mark as selected              │
│  POST /api/watch/discard    - Mark as discarded             │
│  GET  /api/watch/history    - View past selections          │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                  Supabase (PostgreSQL)                       │
│                                                              │
│  Table: watch_candidates                                     │
│  - Video metadata, LLM summaries, fit scores                │
│  - Selection & discard tracking                             │
│  - Timestamp management (ingested_at, used_in_issue_date)   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 What's Implemented (Milestone 1)

### ✅ Backend Foundation
- **Next.js 15** with TypeScript and App Router
- **Supabase Integration** with service role authentication
- **Four Production-Ready API Endpoints**:
  - Shortlist: Returns top 5 candidates (last 3 days, unused, not discarded)
  - Select: Marks candidate for today's newsletter
  - Discard: Editorial rejection
  - History: Previously selected items
- **Full Type Safety** with TypeScript interfaces
- **Comprehensive Validation** (UUID format, state transitions, business logic)
- **Error Handling** with detailed logging

### ✅ Database Schema
- `watch_candidates` table with all required fields
- Indexes for optimal query performance
- `ingested_at` field for accurate recency tracking
- Automatic `updated_at` triggers

---

## 📁 Project Structure

```
OneThingThatMatters/
├── app/
│   ├── api/watch/          # REST API endpoints
│   │   ├── shortlist/route.ts
│   │   ├── select/route.ts
│   │   ├── discard/route.ts
│   │   └── history/route.ts
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
│
├── lib/
│   ├── supabase.ts         # Database client
│   └── types.ts            # TypeScript types
│
├── migrations/
│   └── add_ingested_at.sql # Schema migration
│
├── FULL_PROJECT_PRD.md     # Product requirements
├── FULL_PROJECT_TASKS.md   # Task breakdown
├── PROJECT_STATUS.md       # Current status
└── README.md               # This file
```

---

## 🧪 Testing

### Manual Testing
```bash
# Start dev server
npm run dev

# Test shortlist
curl http://localhost:3000/api/watch/shortlist

# Test select (replace UUID)
curl -X POST http://localhost:3000/api/watch/select \
  -H "Content-Type: application/json" \
  -d '{"id": "your-uuid-here"}'

# Test discard
curl -X POST http://localhost:3000/api/watch/discard \
  -H "Content-Type: application/json" \
  -d '{"id": "your-uuid-here"}'

# Test history
curl http://localhost:3000/api/watch/history
```

---

## 📊 Milestones

### ✅ Milestone 1 - Backend Foundation (COMPLETE)
- [x] Supabase integration
- [x] API endpoints (shortlist, select, discard, history)
- [x] TypeScript types and validation
- [x] Schema with ingested_at field

### 🔜 Milestone 2 - Frontend Watch UI (Next)
- [ ] Tailwind CSS setup
- [ ] /watch page with candidate display
- [ ] Select/Discard buttons with optimistic updates
- [ ] Loading and empty states
- [ ] Selection confirmation

### 🔜 Milestone 3 - Newsletter Builder
- [ ] GET /api/issue/today endpoint
- [ ] Markdown template engine
- [ ] /issue-builder page with preview
- [ ] Copy-to-clipboard functionality

### 🔜 Milestone 4 - History Page
- [ ] /history page
- [ ] Pagination
- [ ] Past issue display

### 🔜 Milestone 5+ - Listen & Read Categories
- [ ] Mirror architecture for Listen category
- [ ] Mirror architecture for Read category
- [ ] Agent automation
- [ ] Embeddings & advanced scoring

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Database | Supabase (PostgreSQL) |
| Runtime | Node.js 20+ |
| Styling | (TBD - Milestone 2) |

---

## 📚 Key Concepts

### Timestamp Semantics
- **`created_at`**: When the row was created in Supabase
- **`updated_at`**: Auto-updated on any field change
- **`ingested_at`**: First discovery by pipeline (immutable, critical for recency)
- **`used_in_issue_date`**: Date selected for newsletter (NULL if unused)

### Shortlist Logic
Items appear in shortlist if:
1. Not yet used (`used_in_issue_date IS NULL`)
2. Not discarded (`discarded = false`)
3. Discovered within last 3 days (`ingested_at >= now() - interval '3 days'`)
4. Ordered by `fit_score DESC`, then `published_at DESC`
5. Limited to top 5 items

### Selection Rules
- ✅ Can select: Unused, not-discarded candidates
- ❌ Cannot select: Already-used candidates
- ❌ Cannot select: Discarded candidates
- Effect: Sets `used_in_issue_date` to today

### Discard Rules
- ✅ Can discard: Unused, not-discarded candidates
- ❌ Cannot discard: Already-used candidates
- ❌ Cannot discard: Already-discarded candidates
- Effect: Sets `discarded = true`

---

## 🔒 Security

- Service role key stored **server-side only** (never exposed to frontend)
- All inputs validated (UUID format, business logic, state transitions)
- Comprehensive error handling with safe error messages
- Future: Row Level Security (RLS) for anon key access

---

## 🐛 Troubleshooting

### Build Fails
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables Not Loading
- Ensure `.env` file exists in project root
- Restart dev server after changing `.env`
- Verify no typos in variable names

### Supabase Connection Errors
1. Verify credentials in `.env`
2. Check Supabase project status
3. Test connection in Supabase dashboard
4. Verify service role key permissions

---

## 📖 Documentation

### For Users
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Setup, testing, troubleshooting
- [FULL_PROJECT_PRD.md](./FULL_PROJECT_PRD.md) - Product vision and requirements

### For Developers
- [MILESTONE_1_COMPLETE.md](./MILESTONE_1_COMPLETE.md) - Implementation details
- [FULL_PROJECT_TASKS.md](./FULL_PROJECT_TASKS.md) - All milestone tasks
- `lib/types.ts` - TypeScript interfaces
- `supabase_schema.sql` - Database structure

---

## 🎓 Development Principles

1. **Type Safety First** - Full TypeScript, no `any`
2. **Validation-First Design** - Validate before DB operations
3. **Clean Architecture** - Separation of types, clients, and routes
4. **Error Handling** - Comprehensive error handling everywhere
5. **Documentation** - Code comments and external docs
6. **Extensibility** - Designed for Listen and Read categories

---

## 📝 License

Private project - All rights reserved

---

## 🙏 Acknowledgments

Built following the specifications in:
- `FULL_PROJECT_PRD.md` - System architecture
- `FULL_PROJECT_TASKS.md` - Implementation plan

---

**Ready to build the frontend!** 🚀

For next steps, see [PROJECT_STATUS.md](./PROJECT_STATUS.md#next-steps-milestone-2)
