# Project Research Summary

**Project:** Weeky
**Domain:** Local-first life journaling / personal archive web app with AI synthesis
**Researched:** 2026-03-02
**Confidence:** HIGH

## Executive Summary

Weeky is a local-first, week-based personal life archive built around the premise that life is roughly 4000 weeks. The app combines a browsable 4000-week grid (the primary navigation), chat-style quick capture, and AI-synthesized week cards (headline + highlights powered by Claude). Experts build this type of product with a clear separation between the local storage layer (IndexedDB via Dexie.js), ephemeral UI state (Zustand), and a server-side AI proxy (Next.js API routes with Vercel AI SDK). The stack is modern and well-documented: Next.js 16 + React 19, Tailwind CSS 4, shadcn/ui, Motion for animations, and TanStack Virtual for the grid. Every technology choice has high-confidence sources and proven compatibility.

The recommended approach is to build the data layer and grid first, then capture, then AI -- in that order. The data model must be designed for future Supabase sync from day one (UUIDs, timestamps, separate stores for entries and syntheses), even though sync itself is deferred to v2. The grid is the product's identity and must be virtualized from the start -- 4000 unvirtualized DOM nodes will kill performance on any device. AI synthesis is an enhancement layer, not the core; the app must function and feel compelling even before AI is wired up.

The three highest risks are: (1) Safari IndexedDB eviction silently destroying a user's journal after 7 days of inactivity -- mitigated by `navigator.storage.persist()`, a data export feature, and PWA home-screen installation; (2) the journaling retention cliff where 80%+ of users abandon within 10 days -- mitigated by an emotionally resonant onboarding (show the life grid immediately, deliver value in 60 seconds, make minimal input produce a satisfying card); and (3) AI synthesis costs spiraling without rate limits and model selection discipline -- mitigated by using Haiku for synthesis, prompt caching, and hard token budgets from the first API call.

## Key Findings

### Recommended Stack

The stack is a standard modern Next.js 16 application with one distinctive layer: Dexie.js for local-first IndexedDB storage instead of a traditional server database. All technologies are current stable releases with verified compatibility. The AI integration uses Vercel AI SDK 6 as the abstraction layer over Claude, which provides streaming, React hooks, and provider-agnostic architecture out of the box.

**Core technologies:**
- **Next.js 16.1 + React 19:** Full-stack framework with Turbopack, PPR, and seamless Vercel deployment
- **Dexie.js 4.3:** IndexedDB wrapper with `useLiveQuery` reactive hooks -- the local-first storage backbone
- **Vercel AI SDK 6 + @ai-sdk/anthropic:** Unified AI provider abstraction with streaming and structured output
- **TanStack Virtual 3.13:** Headless virtualization for the 4000-cell grid -- renders only visible cells at 60fps
- **Motion 12:** Declarative animations for card flips, grid reveals, and page transitions
- **Tailwind CSS 4.2 + shadcn/ui:** Utility-first styling with copy-paste components, fully themeable for the "warm museum" aesthetic
- **Zustand 5:** Minimal client state for UI concerns (grid viewport, selected week, capture drafts)
- **date-fns 4.1:** Tree-shakeable date/week calculations (week numbers, boundaries, formatting)

**Critical version notes:** Next.js 16 requires React 19. Install `motion` not `framer-motion` (rebranded). Install `tw-animate-css` not `tailwindcss-animate` (deprecated). AI SDK 6 requires @ai-sdk/anthropic 3.x.

### Expected Features

**Must have (table stakes -- users expect these):**
- 4000-week grid view as primary navigation (the product IS the grid)
- Quick capture (chat-style timestamped input)
- Week card detail view (front: week number + headline; back: content)
- Persistent local storage (IndexedDB, survives page refresh)
- AI synthesis generating headline + highlights per week
- Raw vs AI toggle on card back
- Data export (JSON) for backup and trust
- Responsive design (functional on mobile browsers)

**Should have (differentiators -- Weeky's competitive advantage):**
- AI-synthesized week card with magazine-style headline (no competitor does this)
- Dual-mode view preserving both raw captures and AI summary (builds trust)
- "Museum browsing" feel with card flip animations and warm aesthetic
- Local-first with no account required (immediate value, no sign-up friction)
- Week-as-card metaphor (front/back, like a physical card)

**Defer (v2+):**
- Supabase auth + cloud sync
- Cross-week threads / theme tracking
- Backfill UX for historical weeks
- AI-generated illustration on card front
- Semantic search (embeddings + vector store)
- External data integration (calendar, photos import)
- Physical card/magazine printing

**Anti-features (explicitly avoid):**
- Daily note granularity (undermines the weekly unit)
- AI chatbot / conversational AI (Weeky is an archivist, not a therapist)
- Mood charts / habit tracking (clinical, not archival)
- Gamification / streaks (creates guilt, contradicts warm museum vibe)
- Real-time AI feedback during writing (interrupts authentic capture)

### Architecture Approach

The architecture is a four-layer client-heavy design: Presentation (React components with virtualized grid, card flip, capture input), State (Zustand stores for ephemeral UI state), Data Access (Dexie.js typed queries), and Storage (IndexedDB with four object stores: entries, weeks, syntheses, settings). AI integration is a separate server-side layer: Next.js API routes proxy Claude calls, streaming responses back via SSE. The key architectural principle is that Zustand holds transient UI state while IndexedDB (via Dexie) is the single source of truth for all user data. Components read via `useLiveQuery` and write via typed db functions -- never directly to IndexedDB.

**Major components:**
1. **WeekGrid (virtualized)** -- Renders ~4000 week cells using TanStack Virtual; only visible cells exist in the DOM
2. **WeekCard (front/back flip)** -- Card container with Motion animations; front shows headline, back shows content
3. **QuickCapture** -- Chat-style input that appends timestamped entries to the current week in IndexedDB
4. **Dexie database layer** -- Four stores (entries, weeks, syntheses, settings) with compound indexes and schema versioning
5. **AI synthesis API route** -- Next.js Edge route that proxies Claude calls with streaming, never exposes API key to client

**Data model decisions that must be made in Phase 1:**
- Use UUIDs (not auto-increment) for all record IDs -- required for future sync
- Separate entries from syntheses in distinct IndexedDB stores -- enables independent re-generation
- Include `createdAt`, `updatedAt`, `deviceId` on every record -- zero-cost now, enormous cost to retrofit later
- Compound index `[weekId+createdAt]` on entries for efficient sorted queries

### Critical Pitfalls

1. **Safari IndexedDB eviction (CRITICAL)** -- Safari deletes all IndexedDB data after 7 days without user interaction. For a weekly journaling app, this means one skipped week = total data loss. **Prevent:** Call `navigator.storage.persist()` at first launch, ship data export in MVP, prompt PWA installation on Safari, display clear "data stored locally" warnings.

2. **Data model not designed for future sync (CRITICAL)** -- Auto-increment IDs, missing timestamps, and blob-per-week storage make Supabase sync in v2 a rewrite instead of an extension. **Prevent:** Use UUIDs, include sync metadata fields, normalize entries as individual records per week, track schema version.

3. **4000-cell grid kills performance without virtualization (CRITICAL)** -- 4000 React-rendered DOM nodes cause 2+ second first paint, scroll jank, and mobile unresponsiveness. **Prevent:** Use TanStack Virtual from day one, keep DOM under 200 elements, memoize cells with `React.memo`, test on throttled CPU.

4. **AI synthesis costs spiral without controls (HIGH)** -- Sonnet/Opus synthesis at $0.50-$2.00 per week card, with unlimited regeneration, becomes unsustainable at even modest user counts. **Prevent:** Use Haiku for synthesis, enable prompt caching (90% cost reduction), cap input/output tokens, rate-limit regeneration to 2 per week.

5. **Journaling retention cliff (HIGH)** -- 80%+ of journaling app users abandon within 10 days. Weekly cadence makes re-engagement harder (6 days between natural touchpoints). **Prevent:** Onboarding must show the life grid with emotional weight in 60 seconds, AI synthesis must produce a compelling card from minimal input, gentle weekly nudge on Saturday.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation -- Data Layer + Project Setup
**Rationale:** Everything depends on the data layer. The IndexedDB schema, Dexie configuration, and typed CRUD operations are prerequisites for every other feature. Getting the data model right here (UUIDs, timestamps, normalized entries) prevents a costly rewrite when adding sync in v2.
**Delivers:** Dexie database with four stores (entries, weeks, syntheses, settings), TypeScript types, week calculation utilities (date-fns), Zustand stores for UI state, project scaffolding (Next.js 16, Tailwind 4, shadcn/ui).
**Addresses:** Persistent local storage, week boundary logic (Sunday-to-Saturday), `navigator.storage.persist()` call.
**Avoids:** Data model not designed for sync (Pitfall 2), Safari eviction (Pitfall 1 -- persist() call).

### Phase 2: Core UI -- Grid + Card Views
**Rationale:** The 4000-week grid IS the product's identity. Building it second (after data) allows rendering real cell states (empty/captured/synthesized) from IndexedDB. The card front/back is the second-most important UI element. These must be built before capture because they demonstrate the product's value.
**Delivers:** Virtualized 4000-week grid with TanStack Virtual, WeekCell with state-dependent styling, WeekCard with front/back flip animation (Motion), grid navigation and "you are here" current week highlight, mobile-responsive grid layout.
**Addresses:** 4000-week grid view, week card detail view, visual timeline navigation, museum browsing feel.
**Avoids:** Grid performance without virtualization (Pitfall 3), rendering 4000 DOM elements (Anti-pattern 2).

### Phase 3: Capture -- Quick Input + Persistence
**Rationale:** With the grid and cards visible, the app needs a way to create data. Chat-style quick capture is the lowest-friction input method and the primary interaction loop. This phase turns the app from a visualization into a functional journaling tool.
**Delivers:** QuickCapture chat-style input with timestamps, entries persisted to IndexedDB via Dexie, grid cells update in real-time via liveQuery when entries are added, autosave with debounce for crash recovery.
**Addresses:** Quick capture (chat-style), date-based organization, capture within current week.
**Avoids:** Blank page UX problem (Pitfall 5 -- include starter prompts), autosave silent failure.

### Phase 4: AI Synthesis -- Claude Integration
**Rationale:** AI synthesis is the core differentiator but it is an enhancement layer, not the foundation. It requires working capture (entries to synthesize) and working cards (a place to display the synthesis). Building it fourth means the app is already usable without AI, and AI adds a "wow" moment.
**Delivers:** Next.js API route proxy for Claude, streaming synthesis via Vercel AI SDK, Zod-validated structured output (headline + highlights), synthesis stored in separate IndexedDB store, card front populated with AI headline, raw vs AI toggle on card back.
**Addresses:** AI synthesis, raw vs AI toggle, card front headline, dual-mode view.
**Avoids:** API key exposure (Pitfall -- server-side only), AI cost spiral (Pitfall 4 -- Haiku + prompt caching + rate limits + token budgets from day one), model deprecation (config constant for model version).

### Phase 5: Onboarding + Polish + Export
**Rationale:** With all core features working, this phase focuses on the emotional first-run experience (the #1 retention lever for journaling apps) and trust-building features (data export). Polish includes empty-state design, grid color coding, animation refinement, and dark mode.
**Delivers:** Onboarding flow (birth date input with explanation, life grid reveal, first capture with immediate card preview), data export (JSON), empty week styling (faded cells with date ranges, not guilt-inducing blanks), dark/light mode (next-themes), toast notifications (Sonner), weekly reminder nudge.
**Addresses:** Reminders, data export, responsive mobile polish, onboarding experience.
**Avoids:** Retention cliff (Pitfall 5 -- emotionally resonant onboarding, value in 60 seconds), Safari data loss (Pitfall 1 -- export as backup mechanism).

### Phase Ordering Rationale

- **Data before UI:** The schema design (UUIDs, timestamps, normalized entries) is a one-time decision that affects everything downstream. Getting it wrong costs weeks of migration work later.
- **Grid before Capture:** Users must see the product's visual identity before they create data. The grid with the "you are here" marker delivers emotional value even when empty. This also forces virtualization to be implemented early, when it's cheapest to get right.
- **Capture before AI:** AI synthesis requires entries to synthesize. Building capture third creates the test data needed for AI development. It also means the app is usable (capture + browse) before the AI integration complexity arrives.
- **AI before Polish:** AI is the differentiator. Delaying it past Phase 4 risks shipping a product that looks like every other life calendar app. The "wow" of seeing your week summarized as a card headline is what validates the product concept.
- **Polish last:** Onboarding, export, and theming are important but they refine an existing experience. They should be informed by actually using the app through Phases 1-4.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (Grid):** The grid is the most performance-sensitive component. Research needed on TanStack Virtual grid configuration for 4000 cells, mobile layout alternatives (year-by-year accordion vs. full grid), and canvas-based minimap for zoomed-out view.
- **Phase 4 (AI Synthesis):** Prompt engineering for card-native output needs iteration. Research needed on optimal prompt structure, Haiku vs Sonnet quality comparison for summarization, structured output with Zod + AI SDK, and prompt caching configuration.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Dexie.js setup, Next.js scaffolding, and Zustand stores follow well-documented patterns. No novel decisions.
- **Phase 3 (Capture):** Chat-style input is a straightforward React component + IndexedDB write. Standard pattern.
- **Phase 5 (Polish):** Onboarding, export, and theming are well-understood UX patterns. The decisions are design-driven, not technically uncertain.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technologies are current stable releases with official documentation. Version compatibility verified across all packages. 18 high-confidence sources. |
| Features | MEDIUM-HIGH | Strong competitor landscape data (Day One, Rosebud, Life Calendar, Obsidian). Some features are novel to Weeky's specific niche (AI-synthesized week cards) so less comparable evidence exists. Feature dependencies are well-mapped. |
| Architecture | HIGH | Local-first + IndexedDB + API route proxy is a documented pattern with multiple production examples. Dexie.js reactive hooks, Zustand state management, and streaming AI integration are all established approaches. |
| Pitfalls | HIGH | Each pitfall backed by multiple verified sources (official WebKit blog for Safari eviction, peer-reviewed JMIR paper for retention data, official Anthropic pricing docs for cost analysis). Recovery strategies are concrete. |

**Overall confidence:** HIGH

### Gaps to Address

- **Safari eviction testing:** The 7-day eviction behavior needs to be verified in the actual deployment environment. Test on real Safari/iOS devices, not just simulators. Consider whether `navigator.storage.persist()` is reliably granted on Safari.
- **AI synthesis quality with minimal input:** No research was done on how well Claude Haiku handles single-sentence or very short journal entries for synthesis. The prompt engineering may need significant iteration to produce compelling headlines from sparse input.
- **Mobile grid layout:** The 4000-cell grid on screens under 768px is an unresolved design question. The research identifies the need for an alternative layout (year-by-year accordion, yearly summary view) but does not prescribe a specific solution.
- **Dexie Cloud vs custom Supabase sync:** When v2 arrives, the choice between Dexie Cloud (commercial, managed) and a custom sync layer with Supabase Realtime is a cost/complexity tradeoff that needs evaluation with real usage data.
- **IndexedDB storage limits:** While IndexedDB supports hundreds of MB to GB, the actual quota varies by browser and device. Photo attachments (v1.x) could approach limits sooner than text-only entries. Need to monitor storage usage and implement a quota warning.

## Sources

### Primary (HIGH confidence)
- [Next.js 16 / 16.1 Blog](https://nextjs.org/blog/next-16) -- framework release details
- [Tailwind CSS v4 Blog](https://tailwindcss.com/blog/tailwindcss-v4) -- CSS-first config, OKLCH colors
- [Dexie.js Official Site](https://dexie.org/) -- API, React hooks, schema versioning
- [Vercel AI SDK Docs](https://ai-sdk.dev/docs/introduction) -- AI SDK 6 features, streaming hooks
- [AI SDK Anthropic Provider](https://ai-sdk.dev/providers/ai-sdk-providers/anthropic) -- Claude integration
- [TanStack Virtual Docs](https://tanstack.com/virtual/latest) -- virtualization API, grid support
- [Motion.dev](https://motion.dev/) -- animation library documentation
- [shadcn/ui Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4) -- component library compatibility
- [WebKit Storage Policy](https://webkit.org/blog/14403/updates-to-storage-policy/) -- Safari eviction rules
- [MDN Storage Quotas](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) -- cross-browser eviction
- [Anthropic Pricing](https://platform.claude.com/docs/en/about-claude/pricing) -- model costs, prompt caching
- [JMIR: Lifestyle App Abandonment](https://www.jmir.org/2024/1/e56897) -- peer-reviewed retention research
- [Ink & Switch: Local-first Software](https://www.inkandswitch.com/essay/local-first/) -- foundational architecture paper

### Secondary (MEDIUM confidence)
- [LogRocket: Offline-first Frontend 2025](https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/) -- IndexedDB vs SQLite comparison
- [Neon: Comparing Local-first Frameworks](https://neon.com/blog/comparing-local-first-frameworks-and-approaches) -- sync engine comparison
- Day One, Rosebud, Life Calendar, Life in Weeks, Obsidian -- competitor feature analysis from official sites and app stores
- 2026 journaling app comparison guides (reflection.app, holstee.com, journaling.guide)

### Tertiary (LOW confidence)
- [IndexedDB pain points gist](https://gist.github.com/pesterhazy/4de96193af89a6dd5ce682ce2adff49a) -- community-documented pitfalls (anecdotal but consistent with official docs)

---
*Research completed: 2026-03-02*
*Ready for roadmap: yes*
