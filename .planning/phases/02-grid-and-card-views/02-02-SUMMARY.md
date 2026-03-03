---
phase: 02-grid-and-card-views
plan: 02
subsystem: ui
tags: [motion, 3d-flip, card-component, dexie-react-hooks, overlay, animation]

# Dependency graph
requires:
  - phase: 01-data-foundation/01
    provides: "Dexie database with entries/syntheses tables, TypeScript types"
  - phase: 01-data-foundation/02
    provides: "Week calculation utilities, Zustand UI store with selectedWeekNumber"
  - phase: 02-grid-and-card-views/01
    provides: "Virtualized WeekGrid with cell click setting selectedWeekNumber, motion library installed"
provides:
  - "WeekCard overlay component with 3D flip animation (CardFront + CardBack)"
  - "CardFront: week number, date range, optional AI headline with graceful degradation"
  - "CardBack: chronological entries with timestamps, warm empty state"
  - "Full grid-to-card flow: click cell -> card overlay -> flip -> close"
affects: [03-capture, 04-ai-synthesis, 05-onboarding-and-polish]

# Tech tracking
tech-stack:
  added: []
  patterns: [3d-flip-animation, modal-overlay-with-backdrop, keyboard-navigation, spring-physics-animation]

key-files:
  created:
    - src/components/card/CardFront.tsx
    - src/components/card/CardBack.tsx
    - src/components/card/WeekCard.tsx
  modified:
    - src/app/page.tsx

key-decisions:
  - "Spring physics for flip animation (stiffness: 200, damping: 30) for natural card-flipping feel"
  - "Graceful degradation: CardFront shows only week number + date range when no synthesis exists"
  - "Click-to-flip interaction with visual hint text that guides first-time users"

patterns-established:
  - "Modal overlay pattern: fixed z-40 overlay with backdrop click-to-close and Escape key"
  - "AnimatePresence wrapping conditional renders for entry/exit animations"
  - "useLiveQuery for reactive data display in card faces"

requirements-completed: [GRID-04, CARD-02, CARD-05, CARD-06]

# Metrics
duration: 2min
completed: 2026-03-03
---

# Phase 2 Plan 2: Week Card with 3D Flip Animation Summary

**Flippable week card overlay with Motion spring-physics 3D flip, front face (week number + optional AI headline), back face (timestamped captures), and keyboard-accessible open/close/flip**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-03T06:57:54Z
- **Completed:** 2026-03-03T06:59:43Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- CardFront displays week number prominently with date range; shows AI headline when synthesis exists, gracefully degrades to just "Week N" + dates when not
- CardBack shows chronologically sorted entries with timestamps, type icons (chat bubble vs pencil), and a warm empty state ("This week is waiting for its story.")
- WeekCard implements 3D flip animation using Motion spring physics (rotateY with perspective), with overlay backdrop, close button, and entry/exit scale+fade animations
- Full browse-then-view flow complete: grid -> click cell -> card front -> flip -> card back -> close -> grid

## Task Commits

Each task was committed atomically:

1. **Task 1: Create CardFront, CardBack, and WeekCard components with flip animation** - `a0a6e94` (feat)
2. **Task 2: Wire WeekCard to main page as overlay triggered by grid cell click** - `26882b4` (feat)

## Files Created/Modified
- `src/components/card/CardFront.tsx` - Front face: week number, date range, optional AI headline via useLiveQuery on syntheses
- `src/components/card/CardBack.tsx` - Back face: chronological entries with timestamps, type icons, empty state
- `src/components/card/WeekCard.tsx` - Card container with 3D flip (Motion rotateY), overlay/backdrop, keyboard nav (Escape/Space/Enter)
- `src/app/page.tsx` - Wired WeekCard overlay with AnimatePresence for entry/exit animations

## Decisions Made
- **Spring physics for flip:** stiffness: 200, damping: 30 provides a satisfying, physical card-flipping feel without being too slow or too snappy
- **Graceful degradation:** When no synthesis exists, CardFront shows only "Week {N}" and date range -- no "no headline" message, keeping the front clean
- **Click-to-flip with hint:** A subtle "Click to flip" text guides discovery while keeping the interface minimal

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Grid-to-card flow is fully functional -- Phase 2 UI complete
- Card back ready to display entries once Phase 3 (Capture) provides data input
- Card front ready to display AI headlines once Phase 4 (AI Synthesis) generates them
- Keyboard accessibility in place for all card interactions
- No blockers for Phase 3 (Quick Capture)

---
*Phase: 02-grid-and-card-views*
*Completed: 2026-03-03*
