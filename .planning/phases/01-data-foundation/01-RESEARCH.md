# Phase 1: Data Foundation - Research

**Researched:** 2026-03-02
**Source:** Synthesized from project-level research (.planning/research/)
**Confidence:** HIGH

## Phase Scope

Phase 1 delivers the data layer, week math, and project scaffolding. It is the foundation everything else builds on.

**Requirements:** DATA-01, DATA-02, DATA-03, DATA-05, UX-03, UX-04
**Goal:** Users have a working app shell with reliable local storage that persists their data across sessions

## Key Technical Decisions

### Stack (from STACK.md)

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1 | Full-stack framework with Turbopack |
| React | 19.x | Required by Next.js 16 |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.2 | CSS-first styling |
| Dexie.js | 4.3.0 | IndexedDB wrapper with reactive hooks |
| dexie-react-hooks | 4.x | `useLiveQuery` for reactive data |
| date-fns | 4.1.0 | Week calculation (tree-shakeable) |
| zustand | 5.0.x | Minimal client state for UI |
| shadcn/ui | latest | Copy-paste component library |
| tw-animate-css | latest | CSS animations (replaces deprecated tailwindcss-animate) |
| zod | 3.x | Schema validation |

### Installation Commands

```bash
npx create-next-app@latest weeky --typescript --tailwind --eslint --app --src-dir

npm install dexie dexie-react-hooks date-fns zustand zod

npx shadcn@latest init
npx shadcn@latest add card button input
```

Note: AI SDK, Motion, TanStack Virtual are NOT needed in Phase 1. Install only when needed in later phases.

### IndexedDB Schema Design (from ARCHITECTURE.md)

Four object stores:

1. **entries** - Individual captures (quick thoughts, reflections)
   - `id`: UUID (string)
   - `weekId`: string (links to week)
   - `content`: string
   - `type`: 'quick' | 'reflection'
   - `createdAt`: ISO timestamp
   - `updatedAt`: ISO timestamp
   - `deviceId`: string (for future sync)

2. **weeks** - Week metadata
   - `id`: UUID (string)
   - `weekNumber`: number (943, 944, etc.)
   - `startDate`: ISO date (Sunday)
   - `endDate`: ISO date (Saturday)
   - `createdAt`: ISO timestamp
   - `updatedAt`: ISO timestamp
   - `deviceId`: string

3. **syntheses** - AI-generated summaries (separate from entries)
   - `id`: UUID
   - `weekId`: string
   - `headline`: string
   - `highlights`: string[]
   - `model`: string (which AI model was used)
   - `createdAt`: ISO timestamp
   - `updatedAt`: ISO timestamp
   - `deviceId`: string

4. **settings** - User preferences
   - `key`: string (primary key)
   - `value`: any
   - `updatedAt`: ISO timestamp

**Critical indexes:**
- entries: `[weekId+createdAt]` compound index for sorted queries per week
- weeks: `weekNumber` for fast lookup
- syntheses: `weekId` for linking to weeks

### Week Calculation (UX-03, UX-04)

- Week runs Sunday to Saturday
- date-fns functions: `startOfWeek(date, { weekStartsOn: 0 })` (0 = Sunday)
- Founder's Week 943 starts 2025-07-20 (a Sunday)
- Week number = 943 + floor((targetSunday - 2025-07-20) / 7 days)
- Need utility functions: `getWeekNumber(date)`, `getWeekBoundaries(weekNumber)`, `getCurrentWeek()`

### Data Persistence (DATA-03)

- Call `navigator.storage.persist()` on first app load
- Handle case where browser denies persistent storage (show warning)
- Dexie handles IndexedDB transactions automatically
- Schema versioning via `db.version(N).stores({...})` for future migrations

### UUID Generation (DATA-02)

- Use `crypto.randomUUID()` (available in all modern browsers)
- deviceId: generate once on first visit, store in settings table
- All records include: id (UUID), createdAt, updatedAt, deviceId

## Architecture Notes

**Data flow pattern:**
- Write: User input -> Dexie.js -> IndexedDB
- Read: Dexie `useLiveQuery` hook -> React component re-render
- State: Zustand for UI-only state (no persisted data)

**Project structure (suggested):**
```
src/
  app/                    # Next.js App Router pages
    layout.tsx
    page.tsx
  lib/
    db.ts                 # Dexie database definition
    week-utils.ts         # Week calculation utilities
    types.ts              # Shared TypeScript types
  stores/
    ui-store.ts           # Zustand UI state
  components/
    providers.tsx         # Client-side providers wrapper
```

## Pitfalls to Avoid

1. **Safari IndexedDB eviction** - Call `navigator.storage.persist()` immediately. Without it, Safari deletes IndexedDB data after 7 days of inactivity.

2. **Auto-increment IDs** - Use UUIDs, not auto-increment. Auto-increment breaks when adding sync later (ID collisions across devices).

3. **Storing all week data as a blob** - Normalize entries as individual records. One-blob-per-week makes sync, search, and individual entry editing impossible.

4. **Missing schema versioning** - Start Dexie at version 1 with explicit schema. Future phases will bump versions as stores evolve.

5. **date-fns weekStartsOn default** - date-fns defaults to Monday (locale-dependent). Always pass `{ weekStartsOn: 0 }` for Sunday-start weeks.

## What Phase 1 Does NOT Include

- No grid visualization (Phase 2)
- No capture input UI (Phase 3)
- No AI synthesis (Phase 4)
- No onboarding flow (Phase 5)
- No Supabase integration (v2)

Phase 1 delivers a minimal app shell that proves the data layer works: a page that shows the database is initialized, week calculation is correct, and data persists across refreshes.

## RESEARCH COMPLETE

---
*Phase: 01-data-foundation*
*Research synthesized: 2026-03-02 from project-level research*
