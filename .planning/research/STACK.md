# Stack Research

**Domain:** Local-first journaling / life-tracking web app with AI synthesis and card-based UI
**Researched:** 2026-03-02
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.1 | Full-stack React framework | Stable Turbopack by default (5-10x faster Fast Refresh), PPR for instant navigation, seamless Vercel deployment. Next.js 16 is the current stable major with active security patches through early 2026. |
| React | 19.x | UI library | Required by Next.js 16. Concurrent rendering, Suspense, and server components are stable. No reason to stay on 18. |
| TypeScript | 5.x | Type safety | Non-negotiable for any serious project. Next.js 16 has first-class TS support. Catches bugs before runtime, essential for data model correctness in a journaling app. |
| Tailwind CSS | 4.2 | Styling | CSS-first configuration (`@theme` directive), OKLCH color space for vivid card colors, 5x faster full builds. No `tailwind.config.js` needed -- everything in CSS. Perfect for the "warm museum" aesthetic with custom color palettes. |
| Vercel | -- | Hosting/deployment | Zero-config deployment for Next.js. Edge functions, analytics, preview deployments. Already decided in project constraints. |

### Database / Storage

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Dexie.js | 4.3.0 | IndexedDB wrapper (local-first storage) | The most ergonomic IndexedDB wrapper. `useLiveQuery` React hook auto-updates components when data changes. Used by 100K+ sites. Schema versioning built in, which matters when the data model evolves. Dexie Cloud available for future sync without rewriting storage layer. |
| Supabase | (future, v2) | Auth + cloud sync + backup | Project constraint for v2. Dexie's storage model maps cleanly to Supabase tables. Defer until local-first is proven. |

### AI Integration

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vercel AI SDK | 6.x | AI provider abstraction + streaming | 20M+ monthly downloads. Unified API across providers, built-in streaming with `useChat`/`useCompletion` hooks, works perfectly with Next.js route handlers. Provider-agnostic means easy switching if needed. |
| @ai-sdk/anthropic | 3.x | Anthropic Claude provider for AI SDK | Official Vercel AI SDK provider for Claude. Handles auth, streaming, structured output. Better than raw `@anthropic-ai/sdk` for a Next.js app because it integrates with AI SDK's React hooks. |
| @anthropic-ai/sdk | 0.78.x | Direct Claude API access (fallback) | Use only if AI SDK provider lacks a feature. Full type safety, streaming, MCP support. Keep as peer dependency. |

### UI Components

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| shadcn/ui | latest (CLI-based) | Component library | Not a dependency -- copies components into your project. Full Tailwind v4 + React 19 support. Card, Dialog, Tooltip, Input components all needed. Themeable via CSS variables for the warm/museum aesthetic. `new-york` style is the default going forward. |
| Motion (formerly Framer Motion) | 12.x | Animation | 30K+ GitHub stars, 8M+ weekly downloads. Declarative API perfect for card flip animations, page transitions, grid reveal effects. `useScroll` for scroll-linked animations in the 4000-week grid. Install `motion` not `framer-motion`. |
| @tanstack/react-virtual | 3.13.x | Virtualization for 4000-week grid | Headless virtualizer at 60FPS. The 4000-week grid is the core UI -- rendering 4000 DOM nodes kills performance. TanStack Virtual renders only visible cells. Supports grid layout, dynamic sizing, window scrolling. 10-15kb, tree-shakeable. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns | 4.1.0 | Date/week calculations | Week number calculation, start/end of week, date formatting. Tree-shakeable -- import only `getWeek`, `startOfWeek`, `endOfWeek`, `eachWeekOfInterval`, `format`. Functional API works with native Date objects. |
| zustand | 5.0.x | Client state management | UI state (selected week, panel open/closed, capture mode). Not for persisted data (that goes in Dexie). Minimal API (1 function), TypeScript-first, no providers needed. Works with Next.js SSR. |
| next-themes | 0.4.6 | Dark/light mode theming | 2-line setup for system-preference-aware dark mode. No flash on load. Integrates with Tailwind v4 via `@custom-variant`. Essential for a "warm museum" app that needs both light and dark aesthetics. |
| sonner | latest | Toast notifications | shadcn/ui has deprecated its own toast in favor of Sonner. Used for save confirmations, AI synthesis status, error messages. |
| tw-animate-css | latest | CSS animations | Replaces deprecated `tailwindcss-animate`. Required by shadcn/ui components for enter/exit animations. |
| zod | 3.x | Schema validation | Validate AI SDK structured output, form inputs, data import/export schemas. Works with AI SDK's `generateObject` for typed Claude responses. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint + next/core-web-vitals | Linting | Next.js built-in config. No extra setup needed. |
| Prettier | Code formatting | Pair with `prettier-plugin-tailwindcss` for automatic class sorting. |
| TypeScript strict mode | Type checking | Enable `strict: true` in tsconfig. Catches null/undefined bugs in data model. |

## Installation

```bash
# Initialize Next.js 16 project
npx create-next-app@latest weeky --typescript --tailwind --eslint --app --src-dir

# Core dependencies
npm install dexie dexie-react-hooks ai @ai-sdk/anthropic @ai-sdk/react motion @tanstack/react-virtual date-fns zustand next-themes sonner zod

# Dev dependencies
npm install -D prettier prettier-plugin-tailwindcss tw-animate-css

# shadcn/ui (CLI-based, not npm)
npx shadcn@latest init
npx shadcn@latest add card button input dialog tooltip textarea
```

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| Dexie.js | RxDB | RxDB is powerful but complex (reactive streams, CRDT-based sync). Overkill for a single-user journaling app. Dexie is simpler and still supports cloud sync via Dexie Cloud when needed. |
| Dexie.js | localStorage | 5MB limit is too small. No indexing, no queries. A journaling app with years of data needs IndexedDB's capacity (hundreds of MB to GB). |
| Dexie.js | OPFS + SQLite WASM | Cutting edge but immature ecosystem. Browser support inconsistent (especially Safari). Dexie on IndexedDB is battle-tested and sufficient for this use case. |
| Vercel AI SDK | @anthropic-ai/sdk directly | Raw SDK works but you'd rewrite streaming, React hooks, and provider abstraction yourself. AI SDK gives all of this for free and is maintained by Vercel (same team as Next.js). |
| date-fns | Day.js | Day.js is 6kb gzipped vs date-fns ~18kb, but date-fns tree-shakes better for selective imports. For this app we only need ~5 functions, so date-fns is smaller in practice. Functional API (no wrapper objects) is cleaner in React. |
| date-fns | Temporal API | TC39 Temporal is not yet available in all browsers without polyfills. Too risky for production. Revisit when browser support is universal. |
| zustand | Redux Toolkit | Massive overkill. This app has minimal global state (UI state only; data is in Dexie). Zustand's 1-function API vs Redux's boilerplate is a clear win. |
| zustand | React Context | Context re-renders all consumers on any change. Zustand's selector-based subscriptions avoid unnecessary re-renders. Critical for a grid with 4000 cells. |
| Motion | CSS animations only | Card flip, grid reveal, and page transitions need orchestration (stagger, spring physics, layout animation). CSS alone cannot express this without painful keyframe management. |
| Motion | GSAP | GSAP is powerful but imperative. Motion's declarative React API (`<motion.div>`) is more natural in a React component tree. GSAP also has licensing concerns for commercial use. |
| TanStack Virtual | react-window | react-window works but TanStack Virtual is more flexible (headless, supports grid layout, dynamic sizing). For a 4000-cell grid with varying content, TanStack's `measureElement` is essential. |
| shadcn/ui | Radix Primitives directly | shadcn/ui IS Radix under the hood, but gives you pre-styled components. Writing Radix primitives from scratch is reinventing the wheel for no benefit. |
| shadcn/ui | Material UI / Chakra | Material UI's design language is wrong for a warm/museum aesthetic. Chakra is less maintained in 2025. shadcn/ui gives full style control via Tailwind -- perfect for custom aesthetics. |
| No rich text editor (MVP) | Tiptap | A rich text editor adds significant complexity. MVP uses plain textarea + markdown. If longer reflections need formatting in v2, Tiptap (headless, ProseMirror-based, MIT license) is the right choice. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `framer-motion` (package name) | Deprecated package name. Library rebranded to `motion`. Old package still works but receives no updates. | `motion` (npm package) |
| `tailwindcss-animate` | Deprecated by shadcn/ui in favor of `tw-animate-css`. Will not receive updates. | `tw-animate-css` |
| localStorage for data | 5MB limit, no indexing, synchronous (blocks main thread), no structured queries. Will break with months of journaling data. | Dexie.js (IndexedDB) |
| Moment.js | Officially deprecated by its own maintainers. 300KB+ bundle. Mutable API causes bugs. | date-fns |
| Redux / Redux Toolkit | Massive boilerplate for an app with minimal global state. Action creators, reducers, slices -- all unnecessary complexity for UI state. | zustand |
| react-virtualized | Aging architecture, slow maintenance, many open issues. Superseded by react-window and TanStack Virtual. | @tanstack/react-virtual |
| CSS Modules | Contradicts Tailwind utility-first approach. Maintaining two styling systems creates confusion. Tailwind v4 is the standard for shadcn/ui. | Tailwind CSS |
| Prisma (for local storage) | Prisma is a server-side ORM. It cannot run in the browser. It would require a server, defeating local-first. | Dexie.js (client-side) |
| Firebase / Firestore | Not local-first by design. Requires always-online connection. Vendor lock-in. Project explicitly chose Supabase for future backend. | Dexie.js now, Supabase later |

## Stack Patterns

**Local-first data flow:**
- Write: User input -> zustand (temp UI state) -> Dexie.js (persisted to IndexedDB)
- Read: Dexie `useLiveQuery` hook -> React component re-render
- AI: Dexie read -> Next.js API route -> AI SDK + Claude -> structured response -> Dexie write

**Card-based UI pattern:**
- Grid: TanStack Virtual renders visible week cells only
- Card front: Week number + AI headline (from Dexie)
- Card back: Motion `layoutId` for shared-element transition, raw records + AI synthesis toggle
- Theme: shadcn/ui Card component, styled via Tailwind CSS variables for warm palette

**AI synthesis pattern:**
- Trigger: User clicks "synthesize" on a week card
- Route: Next.js API route (`/api/synthesize`) calls AI SDK with Claude
- Output: Zod-validated structured response (headline string + highlights array)
- Storage: Write structured output back to Dexie alongside raw records

**If adding Supabase (v2):**
- Use Dexie Cloud addon OR custom sync layer
- Supabase handles: auth, row-level security, backup, cross-device sync
- Dexie remains source of truth locally; Supabase is the sync target
- Because Dexie Cloud is a commercial option, evaluate cost vs building custom sync with Supabase Realtime

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 16.1 | React 19.x | Next.js 16 requires React 19. |
| Tailwind CSS 4.2 | shadcn/ui (latest) | shadcn/ui fully supports Tailwind v4. Use `new-york` style. |
| Dexie 4.3.0 | dexie-react-hooks 4.x | Must match major versions. `useLiveQuery` hook from `dexie-react-hooks`. |
| AI SDK 6.x | @ai-sdk/anthropic 3.x | AI SDK 6 is a major version; ensure anthropic provider matches. Use AI SDK's migration codemod if upgrading. |
| zustand 5.x | React 18+ / React 19 | zustand 5 explicitly supports React 19. |
| Motion 12.x | React 19 | Motion v11+ improved layout animations for React 19 concurrent rendering. |
| next-themes 0.4.6 | Next.js 16, Tailwind v4 | Works with App Router. Use `data-theme` attribute for Tailwind v4 (not `class`). |

## Security Notes

- **Next.js 16.x security advisories (Jan-Feb 2026):** CVE-2025-55184 (DoS in RSC), CVE-2025-55183 (source code exposure), CVE-2026-23864 (RCE in RSC protocol). Always run `npm audit` and keep Next.js patched to latest 16.1.x.
- **Claude API key:** Must be server-side only (Next.js API route or server action). Never expose in client bundle. Use `ANTHROPIC_API_KEY` env var.
- **IndexedDB data:** Unencrypted by default. For sensitive journal entries, consider encrypting values before storing in Dexie. Not MVP-critical but worth noting for future.

## Sources

- [Next.js 16 Blog](https://nextjs.org/blog/next-16) -- Next.js 16 release details (HIGH confidence)
- [Next.js 16.1 Blog](https://nextjs.org/blog/next-16-1) -- Next.js 16.1 release details (HIGH confidence)
- [Tailwind CSS v4 Blog](https://tailwindcss.com/blog/tailwindcss-v4) -- Tailwind v4 release (HIGH confidence)
- [Dexie.js Official Site](https://dexie.org/) -- Dexie API, React hooks, versioning (HIGH confidence)
- [Dexie npm](https://www.npmjs.com/package/dexie) -- Version 4.3.0 confirmed (HIGH confidence)
- [Vercel AI SDK Docs](https://ai-sdk.dev/docs/introduction) -- AI SDK 6 features, hooks (HIGH confidence)
- [AI SDK Anthropic Provider](https://ai-sdk.dev/providers/ai-sdk-providers/anthropic) -- Claude integration (HIGH confidence)
- [@anthropic-ai/sdk npm](https://www.npmjs.com/package/@anthropic-ai/sdk) -- Version 0.78.0 (HIGH confidence)
- [TanStack Virtual Docs](https://tanstack.com/virtual/latest) -- Virtualization API (HIGH confidence)
- [@tanstack/react-virtual npm](https://www.npmjs.com/package/@tanstack/react-virtual) -- Version 3.13.19 (HIGH confidence)
- [Motion.dev](https://motion.dev/) -- Motion library docs, upgrade from framer-motion (HIGH confidence)
- [shadcn/ui Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4) -- shadcn/ui Tailwind v4 support (HIGH confidence)
- [shadcn/ui Changelog](https://ui.shadcn.com/docs/changelog) -- Component updates through Feb 2026 (HIGH confidence)
- [date-fns npm](https://www.npmjs.com/package/date-fns) -- Version 4.1.0 (HIGH confidence)
- [zustand GitHub](https://github.com/pmndrs/zustand) -- Version 5.0.8 (HIGH confidence)
- [next-themes npm](https://www.npmjs.com/package/next-themes) -- Version 0.4.6 (HIGH confidence)
- [LogRocket: Offline-first Frontend 2025](https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/) -- IndexedDB vs SQLite comparison (MEDIUM confidence)
- [Vercel AI SDK 6 Blog](https://vercel.com/blog/ai-sdk-6) -- AI SDK 6 announcement (HIGH confidence)

---
*Stack research for: Weeky (local-first week-based life archive)*
*Researched: 2026-03-02*
