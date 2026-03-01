# Architecture Research

**Domain:** Local-first life journaling web app with AI integration and 4000-item grid
**Researched:** 2026-03-02
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Presentation Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Grid View   │  │  Week Card   │  │  Capture / Reflection    │  │
│  │ (Virtualized │  │  (Front/Back │  │  (Chat Input + Editor)   │  │
│  │  4000 cells) │  │   flip view) │  │                          │  │
│  └──────┬───────┘  └──────┬───────┘  └────────────┬─────────────┘  │
│         │                 │                        │                │
├─────────┴─────────────────┴────────────────────────┴────────────────┤
│                         State Layer (Zustand)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Grid Store  │  │  Week Store  │  │  Capture Store           │  │
│  │ (navigation, │  │ (active week │  │  (draft entries,         │  │
│  │  selection)  │  │  data, mode) │  │   pending synths)        │  │
│  └──────┬───────┘  └──────┬───────┘  └────────────┬─────────────┘  │
│         │                 │                        │                │
├─────────┴─────────────────┴────────────────────────┴────────────────┤
│                      Data Access Layer (Dexie.js)                   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Dexie.js ORM / Queries                    │   │
│  └──────────────────────────┬───────────────────────────────────┘   │
│                             │                                       │
├─────────────────────────────┴───────────────────────────────────────┤
│                      Storage Layer (IndexedDB)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ entries  │  │  weeks   │  │ syntheses│  │    settings      │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      AI Integration Layer                           │
│  ┌──────────────────────┐       ┌───────────────────────────────┐  │
│  │ Next.js API Route    │──────>│ Claude API (Anthropic)        │  │
│  │ (Edge/Serverless     │<──SSE─│ Streaming synthesis           │  │
│  │  proxy, key vault)   │       │                               │  │
│  └──────────────────────┘       └───────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Grid View | Display all ~4000 week cells, handle scroll/zoom, navigate to week | Virtualized grid (react-window `FixedSizeGrid`) rendering only visible cells |
| Week Card | Show front (headline + week number) and back (records + synthesis) | Flip-card component with two states, animated transition |
| Capture Input | Accept quick thoughts (chat-style) and longer reflections | Chat input bar + optional rich text editor area |
| Grid Store | Track viewport position, selected week, zoom level | Zustand store, ephemeral (no persistence needed) |
| Week Store | Hold active week's data, toggle raw/AI mode | Zustand store, reads from Dexie on week selection |
| Capture Store | Buffer draft entries before saving, track pending AI synthesis requests | Zustand store with Dexie write-through |
| Dexie.js Layer | All IndexedDB reads/writes, schema migrations, queries | Dexie.js v4 with typed tables |
| IndexedDB | Persistent browser storage for all user data | Four object stores: entries, weeks, syntheses, settings |
| API Route Proxy | Secure Claude API calls, never expose keys to browser | Next.js Route Handler (Edge runtime) or Vercel AI SDK |
| Claude API | Generate week headlines and curated highlight syntheses | Anthropic Messages API with streaming |

## Recommended Project Structure

```
src/
├── app/                     # Next.js App Router
│   ├── layout.tsx           # Root layout (providers, fonts)
│   ├── page.tsx             # Main page (grid view)
│   ├── week/
│   │   └── [weekId]/
│   │       └── page.tsx     # Week detail page (card front/back)
│   └── api/
│       └── synthesize/
│           └── route.ts     # Claude API proxy (streaming)
├── components/
│   ├── grid/
│   │   ├── WeekGrid.tsx     # Virtualized 4000-cell grid
│   │   ├── WeekCell.tsx     # Individual cell in the grid
│   │   └── GridControls.tsx # Zoom, navigation, time markers
│   ├── card/
│   │   ├── WeekCard.tsx     # Card container (flip logic)
│   │   ├── CardFront.tsx    # Headline + week number display
│   │   └── CardBack.tsx     # Records + AI synthesis view
│   ├── capture/
│   │   ├── QuickCapture.tsx # Chat-style input bar
│   │   └── Reflection.tsx   # Longer-form writing area
│   └── ui/                  # Shared UI primitives
├── stores/
│   ├── gridStore.ts         # Grid viewport & navigation state
│   ├── weekStore.ts         # Active week data & display mode
│   └── captureStore.ts      # Draft entries & synthesis queue
├── db/
│   ├── database.ts          # Dexie instance & schema definition
│   ├── entries.ts           # Entry CRUD operations
│   ├── weeks.ts             # Week record operations
│   └── syntheses.ts         # AI synthesis result storage
├── lib/
│   ├── weekUtils.ts         # Week ID calculation, date math
│   ├── aiPrompts.ts         # Claude prompt templates
│   └── constants.ts         # Week config (start date, range)
└── types/
    └── index.ts             # Shared TypeScript types
```

### Structure Rationale

- **`db/`:** Isolates all IndexedDB/Dexie logic into a dedicated layer. Components never call IndexedDB directly; they go through typed query functions. This makes future migration to Supabase (v2) straightforward -- swap the db layer internals, keep the same API surface.
- **`stores/`:** Zustand stores are thin orchestrators that hold UI state and coordinate between components and the db layer. Separating stores from db prevents coupling UI concerns to storage details.
- **`components/grid/`:** The grid is the most performance-sensitive component. Isolating it lets you optimize rendering independently (virtualization, memoization) without affecting the rest of the UI.
- **`lib/weekUtils.ts`:** Week ID calculation logic (Sunday-to-Saturday, birth-date-relative numbering) is used everywhere. Centralizing it prevents inconsistencies.

## Architectural Patterns

### Pattern 1: IndexedDB-First Write (Local-First Core)

**What:** All data mutations write to IndexedDB first via Dexie.js. The UI reads from IndexedDB (or Zustand hydrated from IndexedDB). No server round-trip for core CRUD operations.
**When to use:** Every user action that creates/updates data (capturing a thought, saving a reflection, storing an AI synthesis result).
**Trade-offs:** Instant UI response and full offline capability, but requires a clear migration path when adding cloud sync in v2.

**Example:**
```typescript
// db/entries.ts
import { db } from './database';

export async function addEntry(weekId: string, content: string, type: 'quick' | 'reflection') {
  return db.entries.add({
    weekId,
    content,
    type,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

// In component: just call addEntry(), UI updates reactively via Dexie's liveQuery
```

### Pattern 2: Reactive Queries with Dexie liveQuery

**What:** Use Dexie's `useLiveQuery` hook to subscribe to IndexedDB queries reactively. When data changes (in any tab), the UI updates automatically.
**When to use:** Anywhere a component needs to display data from IndexedDB -- week entries, synthesis results, grid cell status.
**Trade-offs:** Eliminates manual cache invalidation and ensures multi-tab consistency. Slight overhead vs. one-shot reads, but negligible for this data volume.

**Example:**
```typescript
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';

function WeekEntries({ weekId }: { weekId: string }) {
  const entries = useLiveQuery(
    () => db.entries.where('weekId').equals(weekId).sortBy('createdAt'),
    [weekId]
  );
  // entries auto-updates when data changes, even from another tab
}
```

### Pattern 3: Streaming AI Synthesis via API Route Proxy

**What:** Claude API calls are proxied through a Next.js Route Handler (Edge runtime) that holds the API key. The client sends week entries, receives a streamed synthesis response via SSE, and stores the final result in IndexedDB.
**When to use:** When the user requests AI synthesis for a week (generating headline + highlights).
**Trade-offs:** Requires network connectivity for AI features (acceptable -- AI is an enhancement, not the core). Streaming gives progressive UI feedback. Vercel AI SDK simplifies implementation.

**Example:**
```typescript
// app/api/synthesize/route.ts
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { weekId, entries } = await req.json();

  const result = streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: 'You are a personal life archivist...',
    prompt: `Synthesize these week entries into a headline and highlights:\n${entries}`,
  });

  return result.toDataStreamResponse();
}
```

## Data Flow

### Core Data Flows

```
1. CAPTURE FLOW (user writes a thought)

[User types in QuickCapture]
    ↓
[captureStore.addDraft()]
    ↓
[db.entries.add()] ──> [IndexedDB: entries store]
    ↓ (liveQuery triggers)
[WeekCard/CardBack re-renders with new entry]


2. AI SYNTHESIS FLOW (user requests week summary)

[User clicks "Synthesize" on WeekCard]
    ↓
[weekStore.requestSynthesis(weekId)]
    ↓
[Fetch entries from db] ──> [POST /api/synthesize with entries]
    ↓                              ↓
[Stream chunks arrive]      [Claude API generates]
    ↓                              ↓
[UI shows progressive text] <── [SSE stream back]
    ↓
[On stream complete: db.syntheses.put(weekId, result)]
    ↓
[IndexedDB: syntheses store] ──> [liveQuery updates CardFront headline]


3. GRID NAVIGATION FLOW (user browses life grid)

[User scrolls/clicks in WeekGrid]
    ↓
[gridStore.setViewport()] ──> [react-window re-renders visible cells]
    ↓
[Each visible WeekCell reads from db] ──> [IndexedDB: weeks + syntheses]
    ↓
[Cell shows: filled/empty state, headline preview if synthesized]
    ↓
[User clicks cell] ──> [navigate to /week/[weekId]]
```

### State Management Strategy

```
Zustand Stores (in-memory, ephemeral UI state)
    │
    ├── gridStore: viewport position, zoom, selection
    │   (no persistence -- recomputed on load)
    │
    ├── weekStore: active weekId, display mode (raw/AI)
    │   (no persistence -- derived from URL params)
    │
    └── captureStore: current draft text, synthesis loading state
        (draft persisted to IndexedDB on debounce for crash recovery)

Dexie.js / IndexedDB (persistent, source of truth)
    │
    ├── entries: all captured thoughts and reflections
    ├── weeks: week metadata (status, color, tags)
    ├── syntheses: AI-generated headlines and highlights
    └── settings: user preferences (birth date, display options)
```

**Key principle:** Zustand holds transient UI state; IndexedDB holds durable user data. Zustand stores never persist to IndexedDB via middleware (avoids the known race condition issues with async hydration). Instead, components use `useLiveQuery` for reads and call db functions for writes.

### Suggested IndexedDB Schema (Dexie.js)

```typescript
import Dexie, { type EntityTable } from 'dexie';

interface Entry {
  id?: number;           // Auto-incremented
  weekId: string;        // e.g. "943" (week number from birth)
  content: string;
  type: 'quick' | 'reflection';
  createdAt: Date;
  updatedAt: Date;
}

interface Week {
  weekId: string;        // Primary key, e.g. "943"
  startDate: string;     // ISO date string of Sunday
  endDate: string;       // ISO date string of Saturday
  status: 'empty' | 'captured' | 'synthesized';
  color?: string;        // Optional theme color
}

interface Synthesis {
  weekId: string;        // Primary key, matches Week.weekId
  headline: string;      // AI-generated week title
  highlights: string[];  // Curated highlight strings
  rawResponse: string;   // Full AI response for debugging
  model: string;         // Model used for generation
  generatedAt: Date;
}

interface Settings {
  key: string;           // Primary key
  value: any;
}

const db = new Dexie('weeky') as Dexie & {
  entries: EntityTable<Entry, 'id'>;
  weeks: EntityTable<Week, 'weekId'>;
  syntheses: EntityTable<Synthesis, 'weekId'>;
  settings: EntityTable<Settings, 'key'>;
};

db.version(1).stores({
  entries: '++id, weekId, type, createdAt, [weekId+createdAt]',
  weeks: 'weekId, startDate, status',
  syntheses: 'weekId, generatedAt',
  settings: 'key',
});
```

**Schema rationale:**
- `entries` uses auto-increment ID since one week has many entries. The compound index `[weekId+createdAt]` enables efficient sorted queries for all entries in a week.
- `weeks` and `syntheses` use `weekId` as primary key (one record per week). This makes lookups O(1) and prevents duplicates.
- Syntheses are stored separately from weeks because they are generated asynchronously and may be regenerated. Keeping them separate avoids overwriting week metadata during re-synthesis.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1 user, 4000 weeks | Current architecture. IndexedDB handles this trivially (a few MB of data). Grid virtualization keeps the DOM small. No server needed for data storage. |
| 1-1000 users (v2, Supabase) | Add Supabase auth + Postgres. Keep IndexedDB as local cache, add sync layer. Dexie Cloud or a custom sync queue pattern. API routes already exist for AI -- add auth middleware. |
| 1000+ users | Supabase handles Postgres scaling. Claude API costs become the primary concern -- add usage quotas, model tier selection (Haiku for cheap synthesis, Sonnet for premium). Consider caching popular synthesis prompts. |

### Scaling Priorities

1. **First bottleneck: AI synthesis cost.** Each synthesis call costs tokens. At scale, this is the only meaningful cost driver. Mitigation: cache syntheses aggressively (they rarely change once generated), use cheaper models (Haiku) for preview/draft, let users choose when to synthesize.
2. **Second bottleneck: Sync complexity.** When moving from local-first to cloud sync, conflict resolution becomes real. Mitigation: design the data model for append-only entries (entries are immutable once saved, edits create new versions). This makes sync trivial -- last-write-wins with no meaningful conflicts.

## Anti-Patterns

### Anti-Pattern 1: Zustand Persist Middleware with IndexedDB

**What people do:** Use Zustand's built-in `persist` middleware with an IndexedDB storage adapter to persist all state.
**Why it's wrong:** Zustand's persist middleware has a known race condition with async storage. It may rehydrate an empty store and overwrite real data in IndexedDB. This is well-documented in Zustand GitHub issues (#458, discussion #1721).
**Do this instead:** Use Zustand for ephemeral UI state only. Use Dexie's `useLiveQuery` for reactive reads from IndexedDB. Write to IndexedDB via Dexie's typed API directly from event handlers or store actions.

### Anti-Pattern 2: Rendering 4000 DOM Elements

**What people do:** Map over all 4000 weeks and render a React component for each one without virtualization.
**Why it's wrong:** 4000 DOM nodes will cause significant jank on scroll, high memory usage, and slow initial render (especially on mobile). Browser may become unresponsive.
**Do this instead:** Use react-window's `FixedSizeGrid` to render only the ~50-100 cells visible in the viewport plus a small overscan buffer. This keeps the DOM under 200 elements regardless of total week count.

### Anti-Pattern 3: Calling Claude API from the Browser

**What people do:** Put the Anthropic API key in the client bundle or call the API directly from browser JavaScript.
**Why it's wrong:** Anyone can inspect the network tab, extract the API key, and use it to run up your bill. This is the number-one warning in every AI API integration guide.
**Do this instead:** Always proxy through a Next.js API Route Handler. The API key lives in server-side environment variables only. The browser sends week entries to your route; the route calls Claude and streams the response back.

### Anti-Pattern 4: Storing AI Synthesis in the Same Record as User Entries

**What people do:** Put the AI-generated headline and highlights directly on the entry or week record.
**Why it's wrong:** Re-synthesis overwrites the record, making it impossible to compare versions. Mixing user data with generated data makes the sync boundary unclear when adding cloud sync later.
**Do this instead:** Store syntheses in a separate IndexedDB object store keyed by weekId. This allows independent re-generation, version comparison, and clean sync boundaries.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Claude API (Anthropic) | Next.js Route Handler proxy with Vercel AI SDK (`streamText` + `@ai-sdk/anthropic`) | Use Edge runtime for low latency. Stream via SSE. Never expose API key client-side. |
| Vercel (deploy) | Standard Next.js deploy, static export where possible | Grid page is client-rendered (needs IndexedDB). API routes are serverless functions. |
| Supabase (v2) | Add auth (Supabase Auth) and sync (Postgres + real-time subscriptions) | Defer to v2. Design IndexedDB schema to be sync-compatible (use UUIDs for entries if planning ahead). |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Components <-> Zustand Stores | Direct import + hooks (`useGridStore`, `useWeekStore`) | Stores are thin -- mostly derived state and action dispatchers |
| Components <-> IndexedDB | Via `useLiveQuery` for reads, via `db/` functions for writes | Components never import Dexie directly -- always through the `db/` module |
| Zustand Stores <-> IndexedDB | Store actions call `db/` functions for writes; liveQuery handles reads | No Zustand persist middleware -- stores don't own persistent data |
| Client <-> API Route | `fetch('/api/synthesize')` with streaming response | Client sends entry content, receives streamed synthesis |
| API Route <-> Claude | Vercel AI SDK / Anthropic SDK | Server-side only. Handles rate limits, retries, error mapping. |

## Build Order (Dependency Chain)

Based on the component boundaries and data flow analysis above, the recommended build sequence is:

```
Phase 1: Foundation
  db/ (Dexie schema + CRUD)  ──>  stores/ (Zustand stores)  ──>  types/

Phase 2: Core UI
  WeekGrid (virtualized)  ──depends on──>  db/ + stores/
  WeekCell  ──depends on──>  db/ (liveQuery for cell status)
  WeekCard (front/back)  ──depends on──>  db/ (entries + syntheses)

Phase 3: Input
  QuickCapture  ──depends on──>  db/entries + captureStore
  Reflection editor  ──depends on──>  db/entries + captureStore

Phase 4: AI
  /api/synthesize route  ──depends on──>  Vercel AI SDK + API key config
  Synthesis UI (trigger + stream display)  ──depends on──>  API route + db/syntheses

Phase 5: Polish
  Raw/AI toggle  ──depends on──>  Phase 2 + Phase 4
  Week status indicators in grid  ──depends on──>  Phase 2 + Phase 3
```

**Rationale:** The data layer (Phase 1) has zero dependencies and everything depends on it -- build it first. Grid and card UI (Phase 2) are the product's identity and can be built with mock data. Input (Phase 3) creates real data for the grid to display. AI (Phase 4) enhances existing data -- it does not block core functionality. Polish (Phase 5) integrates everything.

## Sources

- [Offline-first frontend apps in 2025: IndexedDB and SQLite in the browser (LogRocket)](https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/)
- [Local-first web application architecture (Plain Vanilla Web)](https://plainvanillaweb.com/blog/articles/2025-07-16-local-first-architecture/)
- [Building an Offline-First PWA Notes App with Next.js, IndexedDB, and Supabase (Medium)](https://oluwadaprof.medium.com/building-an-offline-first-pwa-notes-app-with-next-js-indexeddb-and-supabase-f861aa3a06f9)
- [Dexie.js official site](https://dexie.org/)
- [Zustand + IndexedDB persist discussions (GitHub #1721, #2475)](https://github.com/pmndrs/zustand/discussions/1721)
- [react-window virtualization (web.dev)](https://web.dev/virtualize-long-lists-react-window/)
- [react-virtuoso documentation](https://virtuoso.dev/)
- [Building a Production-Ready Claude Streaming API with Next.js Edge Runtime (DEV Community)](https://dev.to/bydaewon/building-a-production-ready-claude-streaming-api-with-nextjs-edge-runtime-3e7)
- [Vercel AI SDK: Anthropic provider docs](https://ai-sdk.dev/providers/ai-sdk-providers/anthropic)
- [AI SDK 6 announcement (Vercel)](https://vercel.com/blog/ai-sdk-6)
- [Building AI-Powered Apps in 2026: Integrating OpenAI and Claude APIs (Nucamp)](https://www.nucamp.co/blog/building-ai-powered-apps-in-2026-integrating-openai-and-claude-apis-with-react-and-node)
- [Mastering Dexie.js: Schema Design (StudyRaid)](https://app.studyraid.com/en/read/11356/355143/optimizing-database-schema-design)
- [Local-first software (Ink & Switch)](https://www.inkandswitch.com/essay/local-first/)

---
*Architecture research for: Weeky -- local-first life journaling web app*
*Researched: 2026-03-02*
