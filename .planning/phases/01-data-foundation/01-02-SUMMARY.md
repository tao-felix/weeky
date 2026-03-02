---
phase: 01-data-foundation
plan: 02
subsystem: week-math
tags: [date-fns, vitest, zustand, tdd, indexeddb, dexie-react-hooks]

# Dependency graph
requires:
  - phase: 01-data-foundation/01
    provides: "Next.js scaffold, Dexie database, TypeScript types, shadcn/ui components"
provides:
  - "Week calculation utilities (getWeekNumber, getWeekBoundaries, getCurrentWeek)"
  - "Epoch anchoring system (Week 943 = 2025-07-20)"
  - "Zustand UI store for client-side state management"
  - "App shell page proving database, week math, and persistence work together"
  - "Vitest test infrastructure with 23 passing tests"
affects: [02-grid-and-card, 03-capture, 04-ai-synthesis]

# Tech tracking
tech-stack:
  added: [vitest-4, vitejs-plugin-react]
  patterns: [tdd-red-green-refactor, sunday-start-weeks, epoch-anchored-week-numbers, zustand-ui-store]

key-files:
  created:
    - src/lib/week-utils.ts
    - src/lib/week-utils.test.ts
    - src/stores/ui-store.ts
    - vitest.config.ts
  modified:
    - src/app/page.tsx
    - package.json

key-decisions:
  - "Week 1 starts on 2007-07-01 (corrected from plan's 2007-08-19 which was a math error)"
  - "All date constructors use local timezone (new Date(year, month, day)) to avoid UTC/local mismatches"
  - "Zustand store is intentionally minimal -- only selectedWeekNumber for now"

patterns-established:
  - "TDD: RED (failing tests) -> GREEN (implementation) -> REFACTOR cycle"
  - "Week calculation: always use weekStartsOn: 0 for Sunday-start weeks with date-fns"
  - "Epoch anchoring: all week numbers relative to EPOCH_WEEK_NUMBER (943) and EPOCH_DATE (2025-07-20)"
  - "Round-trip consistency: getWeekNumber(getWeekBoundaries(N).start) === N"

requirements-completed: [UX-03, UX-04]

# Metrics
duration: 5min
completed: 2026-03-02
---

# Phase 1 Plan 2: Week Math + App Shell Summary

**TDD-driven week calculation utilities mapping any date to a week number (epoch: Week 943 = 2025-07-20), with Zustand UI store and app shell proving database + math + persistence integration**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-02T00:02:34Z
- **Completed:** 2026-03-02T00:07:45Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Week calculation module with getWeekNumber, getWeekBoundaries, getCurrentWeek -- 23 tests all passing
- Zustand UI store with selectedWeekNumber state for client-only UI management
- App shell page that displays current week info, database entry count (via useLiveQuery), test entry creation, and Zustand state
- Vitest test infrastructure set up with path alias support

## Task Commits

Each task was committed atomically:

1. **Task 1 (RED): Add failing tests for week calculation** - `7bfa2ca` (test)
2. **Task 1 (GREEN): Implement week calculation utilities** - `da40843` (feat)
3. **Task 2: Zustand UI store and app shell page** - `7f12a0c` (feat)

_TDD task has separate RED and GREEN commits._

## Files Created/Modified
- `src/lib/week-utils.ts` - Week calculation utilities (getWeekNumber, getWeekBoundaries, getCurrentWeek)
- `src/lib/week-utils.test.ts` - 23 test cases covering epoch mapping, boundaries, round-trip, increment/decrement
- `src/stores/ui-store.ts` - Zustand store with selectedWeekNumber state
- `src/app/page.tsx` - App shell page with 4 cards: week info, database status, persistence, UI state
- `vitest.config.ts` - Vitest configuration with @/ path alias
- `package.json` - Added test and test:watch scripts, vitest + @vitejs/plugin-react devDependencies

## Decisions Made
- **Week 1 = 2007-07-01:** Plan incorrectly stated week 1 = 2007-08-19. Actual math: 943 - 1 = 942 weeks back from 2025-07-20 = 2007-07-01. Corrected test expectations accordingly.
- **Local timezone date constructors:** Used `new Date(year, month, day)` instead of date-only strings (`new Date('2025-07-20')`) to avoid UTC/local timezone mismatches in test assertions.
- **Minimal Zustand store:** Only `selectedWeekNumber` for now. Later phases will add captureMode, gridViewport, panelOpen states.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrected week 1 date calculation in test expectations**
- **Found during:** Task 1 (GREEN phase)
- **Issue:** Plan specified `getWeekNumber(new Date('2007-08-19')) === 1` and `getWeekBoundaries(1) === { start: '2007-08-19', end: '2007-08-25' }`. The actual math shows week 1 = 2007-07-01 (942 * 7 = 6594 days before 2025-07-20).
- **Fix:** Updated 3 test expectations to use mathematically correct values: week 1 starts 2007-07-01, 2007-08-19 is week 8, week 0 starts 2007-06-24.
- **Files modified:** src/lib/week-utils.test.ts
- **Verification:** All 23 tests pass with correct values; round-trip consistency confirmed.
- **Committed in:** da40843 (GREEN phase commit)

**2. [Rule 1 - Bug] Fixed timezone-unsafe date constructors in tests**
- **Found during:** Task 1 (GREEN phase)
- **Issue:** Tests used `new Date('2025-07-20')` (date-only = UTC midnight) which in GMT+8 becomes 8am local time, causing potential mismatches with EPOCH_DATE (local midnight).
- **Fix:** Changed all test date constructors to `new Date(year, month, day)` for explicit local midnight, ensuring timezone-safe behavior.
- **Files modified:** src/lib/week-utils.test.ts
- **Verification:** Tests pass in GMT+8 environment.
- **Committed in:** da40843 (GREEN phase commit)

---

**Total deviations:** 2 auto-fixed (2 bugs in plan's test expectations)
**Impact on plan:** Both fixes were necessary for mathematical correctness and cross-timezone reliability. No scope creep.

## Issues Encountered
None beyond the corrected test expectations documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 1 Data Foundation is now complete (both plans executed)
- Week math module ready for grid navigation in Phase 2
- Dexie database with typed stores ready for entry capture in Phase 3
- Zustand UI store ready for expansion in Phase 2 (grid viewport, panel states)
- App shell page can be replaced/evolved into the actual grid UI in Phase 2
- No blockers for Phase 2

## Self-Check: PASSED

All 5 created/modified files verified on disk. All 3 task commits (7bfa2ca, da40843, 7f12a0c) verified in git log. week-utils.ts exports 5 symbols. ui-store.ts exports 1 symbol. 23/23 tests pass. Build succeeds.

---
*Phase: 01-data-foundation*
*Completed: 2026-03-02*
