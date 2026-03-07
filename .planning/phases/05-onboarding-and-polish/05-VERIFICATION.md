---
phase: 05-onboarding-and-polish
verified: 2026-03-07T15:30:00Z
status: human_needed
score: 9/9 must-haves verified
human_verification:
  - test: "First-time onboarding flow: clear IndexedDB, refresh, verify modal appears and emotional revelation shows"
    expected: "Full-screen onboarding modal appears, birth date input works, clicking 'See my weeks' shows 'You've lived X weeks / You have roughly Y left' for 3 seconds, then grid appears"
    why_human: "AnimatePresence transitions and 3-second emotional pause require visual inspection; week count accuracy requires runtime calculation"
  - test: "Returning user skip: after onboarding, refresh page, verify grid loads immediately without onboarding"
    expected: "Grid appears directly with no onboarding modal; useLiveQuery reads birthDate from Dexie and skips the modal"
    why_human: "IndexedDB persistence across page reloads can only be verified in a live browser session"
  - test: "Dark/light mode toggle: click sun/moon icon in grid header, verify visual theme switch"
    expected: "Clicking the icon switches between dark (dark backgrounds, light text) and light (light backgrounds, dark text) mode; icon updates to show Sun or Moon"
    why_human: "CSS class toggling on documentElement and visual correctness require browser rendering to verify"
  - test: "Theme persistence: switch theme, refresh page, verify same theme applies"
    expected: "Theme choice survives page refresh; Dexie settings store persists the value; useThemeInit in Providers applies it on mount"
    why_human: "Cross-session persistence requires live IndexedDB interaction"
  - test: "Export button: click download icon, verify JSON file downloads and contains all data arrays"
    expected: "File named weeky-export-YYYY-MM-DD.json downloads; opening it shows { version: 1, exportedAt, data: { entries, weeks, syntheses, settings } } with all current data"
    why_human: "Blob download and file contents require browser interaction and file system inspection"
---

# Phase 05: Onboarding and Polish Verification Report

**Phase Goal:** New users have an emotionally resonant first experience, and all users can export their data and choose their visual theme
**Verified:** 2026-03-07T15:30:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | First-time user sees an onboarding modal asking for their birth date before the grid | VERIFIED | `src/app/page.tsx` lines 26-34: `if (birthDateSetting === null) return <OnboardingModal .../>` |
| 2  | After entering birth date, the life grid is revealed with emotional weight | VERIFIED | `OnboardingModal.tsx` lines 93-128: step='revelation' shows "You've lived X weeks / You have roughly Y left" at text-4xl/5xl; 3-second setTimeout before `onComplete()` |
| 3  | User understands the 4000-week concept within 60 seconds of first visit | VERIFIED (needs human) | Modal step 1 shows heading "Your life in weeks" and text "From age 18 to 95, life is roughly 4,000 weeks. Each one deserves to be remembered." — readability needs human confirmation |
| 4  | Returning users skip onboarding and see the grid immediately | VERIFIED | `page.tsx` lines 16-18: `useLiveQuery(() => db.settings.get('birthDate').then(s => s ?? null))` — returning users have non-null value, reaches grid render at line 37-46 |
| 5  | Birth date is persisted in Dexie settings so onboarding only happens once | VERIFIED | `OnboardingModal.tsx` line 32: `await db.settings.put({ key: 'birthDate', value: birthDateStr, updatedAt: now })` |
| 6  | User can switch between dark and light mode via a visible toggle | VERIFIED (needs human) | `ThemeToggle.tsx` renders Sun/Moon button in WeekGrid header (lines 100-103 of WeekGrid.tsx); toggle function applies `document.documentElement.classList.add/remove('dark')` |
| 7  | Theme choice persists across page refreshes (stored in Dexie settings) | VERIFIED | `ThemeToggle.tsx` line 44-48: `db.settings.put({ key: 'theme', value: next, ... })`; `providers.tsx` lines 38-57: `useThemeInit()` reads and applies on mount |
| 8  | User can export all their data as a JSON file download | VERIFIED (needs human) | `ExportButton.tsx` calls `exportAllData()` on click; `export-utils.ts` creates blob and programmatic `<a>` click |
| 9  | Exported JSON contains entries, syntheses, weeks, and settings | VERIFIED | `export-utils.ts` lines 4-9: `Promise.all([db.entries.toArray(), db.weeks.toArray(), db.syntheses.toArray(), db.settings.toArray()])` — all 4 tables collected into `data` object |

**Score:** 9/9 truths verified (5 need human confirmation for visual/runtime behavior)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/ThemeToggle.tsx` | Theme toggle with Sun/Moon icon | VERIFIED | 67 lines; reads db.settings on mount; toggles dark class + persists; min_lines 20 satisfied |
| `src/lib/export-utils.ts` | exportAllData function with JSON blob download | VERIFIED | 36 lines; exports `exportAllData`; queries all 4 Dexie tables; creates Blob and triggers download |
| `src/components/ExportButton.tsx` | Export button calling exportAllData | VERIFIED | 32 lines; imports and calls exportAllData; loading state via `exporting` state; min_lines 15 satisfied |
| `src/components/onboarding/OnboardingModal.tsx` | Full-screen onboarding with birth date and revelation | VERIFIED | 132 lines; two-step flow (input/revelation); AnimatePresence transitions; min_lines 60 satisfied |
| `src/app/page.tsx` | Conditional render based on birthDate | VERIFIED | 47 lines; useLiveQuery with null sentinel; three branches (loading/onboarding/grid); min_lines 15 satisfied |
| `src/lib/week-utils.ts` (getWeeksLived) | Helper calculating weeks from birth date | VERIFIED | Lines 41-43: `Math.floor(differenceInCalendarDays(new Date(), birthDate) / 7)` |
| `src/components/providers.tsx` (useThemeInit) | Early theme application hook | VERIFIED | Lines 38-57: reads db.settings, applies dark class or system preference |
| `src/app/layout.tsx` | suppressHydrationWarning on html tag | VERIFIED | Line 27: `<html lang="en" suppressHydrationWarning>` |
| `src/components/grid/WeekGrid.tsx` | ThemeToggle and ExportButton in header | VERIFIED | Lines 19-20: imports; lines 101-102: `<ExportButton />` and `<ThemeToggle />` in header flex group |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `ThemeToggle.tsx` | `db.settings` | `db.settings.put/get` | WIRED | Line 14: `db.settings.get('theme')`; line 44: `db.settings.put(...)` |
| `ThemeToggle.tsx` | `document.documentElement` | `classList.add/remove('dark')` | WIRED | Lines 34-36: `document.documentElement.classList.add('dark')` / `.remove('dark')` |
| `export-utils.ts` | `db.entries/syntheses/weeks/settings` | `Dexie toArray()` | WIRED | Lines 5-8: all 4 tables called with `.toArray()` in Promise.all |
| `OnboardingModal.tsx` | `db.settings` | `db.settings.put birthDate` | WIRED | Line 32: `db.settings.put({ key: 'birthDate', value: birthDateStr, updatedAt: now })` |
| `page.tsx` | `OnboardingModal.tsx` | `useLiveQuery birthDate check` | WIRED | Lines 16-18: `useLiveQuery(() => db.settings.get('birthDate').then(s => s ?? null))`; line 26: condition on `birthDateSetting === null` |
| `OnboardingModal.tsx` | `week-utils.ts` | `getWeeksLived` | WIRED | Line 6: `import { getWeeksLived }`; line 24: `const lived = getWeeksLived(birthDate)` |

All 6 key links are WIRED.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| UX-01 | 05-02-PLAN.md | First-run asks for start date and reveals the life grid with emotional weight | SATISFIED | `OnboardingModal.tsx` implements full flow; `page.tsx` conditional render; birth date persisted in Dexie |
| UX-02 | 05-01-PLAN.md | Dark and light mode support | SATISFIED | `ThemeToggle.tsx` + `useThemeInit` in providers + `suppressHydrationWarning` in layout |
| DATA-04 | 05-01-PLAN.md | User can export all data as JSON for backup | SATISFIED | `export-utils.ts` + `ExportButton.tsx` collect all 4 Dexie tables and trigger JSON file download |

All 3 requirement IDs declared in PLAN frontmatter are accounted for and satisfied.

**Orphaned requirements check:** REQUIREMENTS.md traceability table maps UX-01, UX-02, DATA-04 to Phase 5. No additional Phase 5 requirements exist in REQUIREMENTS.md that are not claimed by these plans. No orphaned requirements.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `ThemeToggle.tsx` | 52 | `return null` | Info | Legitimate hydration guard: returns null only before mount to prevent React hydration mismatch. Not a stub — the full component renders after `mounted === true`. |

No blocker or warning anti-patterns found. The single `return null` is a correct pattern for SSR hydration safety.

### Build Verification

Build passes cleanly:
```
Route (app)
┌ ○ /
├ ○ /_not-found
└ ƒ /api/synthesize
```
No TypeScript errors. No build warnings.

### Human Verification Required

All automated checks pass. The following items require human browser verification:

#### 1. First-time Onboarding Flow

**Test:** Clear IndexedDB for weeky database (DevTools -> Application -> IndexedDB -> weeky -> Delete database), refresh page
**Expected:** Full-screen onboarding modal appears with warm stone aesthetic; enter a birth date and click "See my weeks"; revelation message shows "You've lived X weeks / You have roughly Y left" with large text; after 3 seconds the grid appears automatically
**Why human:** AnimatePresence transitions, emotional weight of the revelation phrasing, and week count accuracy all require visual and runtime inspection

#### 2. Returning User Skip

**Test:** After completing onboarding, refresh the page
**Expected:** Grid loads directly without any onboarding modal; useLiveQuery detects birthDate in Dexie and renders the grid branch
**Why human:** IndexedDB persistence across page reloads requires a live browser session

#### 3. Dark/Light Mode Toggle

**Test:** Click the sun or moon icon in the top-right corner of the grid header
**Expected:** Entire page switches theme (backgrounds, text, cell colors all update); icon flips between Sun and Moon appropriately
**Why human:** CSS class toggling on documentElement and visual correctness of all dark: variants require browser rendering

#### 4. Theme Persistence

**Test:** Switch theme to dark, refresh page
**Expected:** Dark theme loads immediately on refresh (useThemeInit applies it on mount before first render)
**Why human:** Cross-session Dexie read and class application timing requires live browser verification

#### 5. Data Export

**Test:** Click the download icon in the grid header; open the downloaded file
**Expected:** File named `weeky-export-YYYY-MM-DD.json` appears in downloads; file contains `{ version: 1, exportedAt: "...", data: { entries: [...], weeks: [...], syntheses: [...], settings: [...] } }`
**Why human:** Blob download mechanics and file content inspection require browser interaction

---

## Summary

Phase 05 goal is fully implemented in code. All 9 observable truths are backed by substantive, wired implementations:

- **UX-02 (Dark/Light Mode):** ThemeToggle component with Sun/Moon icons writes to Dexie settings and toggles the `dark` class on `documentElement`. useThemeInit in Providers applies the stored preference on mount. suppressHydrationWarning prevents SSR flash. Both controls are placed in WeekGrid header.

- **DATA-04 (JSON Export):** exportAllData in export-utils.ts collects all 4 Dexie tables via Promise.all, wraps them in a versioned JSON structure, and triggers a client-side blob download. ExportButton provides UI with loading state.

- **UX-01 (Onboarding):** OnboardingModal implements a two-step emotional flow (birth date input -> revelation with weeks lived/remaining). page.tsx uses useLiveQuery with null sentinel to distinguish loading/first-time/returning states. Birth date is persisted to Dexie so onboarding runs exactly once.

All 3 task commits (0d1d43a, e07d8f4, f166bab) are verified in git log. Build passes with no errors. No anti-patterns found that block the goal.

5 items require human browser verification for visual/runtime correctness.

---
_Verified: 2026-03-07T15:30:00Z_
_Verifier: Claude (gsd-verifier)_
