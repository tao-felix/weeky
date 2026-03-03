# Phase 2: Grid and Card Views - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Virtualized 4000-week grid as the primary navigation and a flippable week card (front: week number, back: raw captures). Grid must render performantly with virtualization. Card has flip animation between front and back.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All visual and interaction design decisions are at Claude's discretion:
- Grid layout and density (year rows, cell size, spacing)
- Week cell visual states (empty, has-captures, AI-synthesized, current week)
- Card front/back design and flip animation style
- Navigation and "you are here" marker
- Mobile responsive layout approach
- Color palette and typography for the "warm museum" aesthetic
- Empty state treatment for weeks with no data
- How week card detail opens from grid (modal, slide-in, navigation)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `shadcn/ui Card` component: shadow/rounded variants, can style week cards
- `shadcn/ui Button`: for interactions
- `week-utils.ts`: getWeekNumber, getWeekBoundaries, getCurrentWeek, EPOCH constants
- `db.ts` + `useLiveQuery`: reactive IndexedDB queries for entry/synthesis state per week
- `useUIStore`: selectedWeekNumber state already exists

### Established Patterns
- Client components with `'use client'` and Dexie hooks
- Zustand for UI state, Dexie for persisted data
- Tailwind CSS for styling

### Integration Points
- `src/app/page.tsx` will be replaced with grid view
- `useUIStore.selectedWeekNumber` connects to card detail view
- `db.entries` and `db.syntheses` drive cell color-coding

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. Research SUMMARY.md references "museum browsing feel" and card-as-metaphor (front/back like a physical card).

</specifics>

<deferred>
## Deferred Ideas

None — discussion skipped by user choice.

</deferred>

---

*Phase: 02-grid-and-card-views*
*Context gathered: 2026-03-03*
