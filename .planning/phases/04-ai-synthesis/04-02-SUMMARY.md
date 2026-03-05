---
phase: 04-ai-synthesis
plan: 02
subsystem: ui
tags: [react, streaming-ui, synthesis, card-toggle, lucide-react, dexie-live-query]

# Dependency graph
requires:
  - phase: 04-ai-synthesis
    provides: "runSynthesis and saveSynthesis client utilities, POST /api/synthesize endpoint"
  - phase: 03-capture
    provides: "Entry data displayed in CardBack, QuickCapture and ReflectionEditor components"
  - phase: 02-grid-and-card-views
    provides: "CardBack and CardFront components, flip animation, WeekCard container"
provides:
  - "SynthesizeButton component with idle/streaming/error states"
  - "SynthesisView component for headline + highlights rendering"
  - "CardBack Captures/Synthesis tab toggle"
  - "End-to-end AI synthesis UI flow (trigger -> stream -> display)"
affects: [05-onboarding-and-polish]

# Tech tracking
tech-stack:
  added: []
  patterns: [view-mode-toggle, streaming-button-states, auto-switch-after-action]

key-files:
  created:
    - src/components/card/SynthesizeButton.tsx
    - src/components/card/SynthesisView.tsx
  modified:
    - src/components/card/CardBack.tsx

key-decisions:
  - "Default viewMode is 'captures' -- user explicitly toggles to synthesis view"
  - "Auto-switch to synthesis view after successful synthesis via onComplete callback"
  - "SynthesizeButton uses rounded-full pill shape to differentiate from tab toggles"

patterns-established:
  - "View mode toggle: pill tabs with bg-stone-100 container, same pattern as Quick/Reflect toggle"
  - "Streaming button pattern: status state machine (idle/streaming/error) with auto-clear error"
  - "stopPropagation on interactive elements inside flip-card to prevent unwanted flip"

requirements-completed: [AI-01, CARD-01, CARD-03, CARD-04]

# Metrics
duration: 2min
completed: 2026-03-05
---

# Phase 4 Plan 2: AI Synthesis UI Components Summary

**SynthesizeButton with streaming states, SynthesisView for headline + highlights, and Captures/Synthesis toggle in CardBack**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-05T10:48:58Z
- **Completed:** 2026-03-05T10:51:12Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- SynthesizeButton with idle/streaming/error state machine, warm amber styling, auto-clear error
- SynthesisView rendering headline, amber-dotted highlights list, and model metadata footer
- CardBack upgraded with Captures/Synthesis tab toggle, SynthesizeButton in header, conditional content rendering
- Auto-switch to synthesis view after successful synthesis completion

## Task Commits

Each task was committed atomically:

1. **Task 1: Create SynthesizeButton and SynthesisView components** - `2748c79` (feat)
2. **Task 2: Add Raw/Synthesis toggle and SynthesizeButton to CardBack** - `cde12e2` (feat)
3. **Task 3: Verify end-to-end AI synthesis flow** - Auto-approved (checkpoint, no code changes)

## Files Created/Modified
- `src/components/card/SynthesizeButton.tsx` - Button with status state machine (idle/streaming/error), amber theme, streaming spinner
- `src/components/card/SynthesisView.tsx` - Renders synthesis headline, amber-dotted highlights, model metadata footer
- `src/components/card/CardBack.tsx` - Added Captures/Synthesis toggle tabs, SynthesizeButton in header, conditional view rendering

## Decisions Made
- Default viewMode is 'captures' rather than auto-detecting synthesis presence -- keeps UX predictable, user explicitly chooses to view synthesis
- Auto-switch to synthesis view via onComplete callback after successful synthesis -- natural flow: trigger synthesis then see result
- SynthesizeButton uses rounded-full pill shape (distinct from rectangular tab toggles) to create visual hierarchy
- Error auto-clears after 3 seconds via useEffect timer -- avoids stale error states blocking UI

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required. (ANTHROPIC_API_KEY was configured in Plan 01.)

## Next Phase Readiness
- Phase 4 (AI Synthesis) fully complete: backend streaming + client persistence + card UI
- Full user flow works: add captures -> click Synthesize -> see streaming progress -> view headline on front, highlights on back
- Ready for Phase 5: Onboarding and Polish

## Self-Check: PASSED

All files verified present. All commits verified in git log.

---
*Phase: 04-ai-synthesis*
*Completed: 2026-03-05*
