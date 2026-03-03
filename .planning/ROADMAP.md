# Roadmap: Weeky

## Overview

Weeky delivers a local-first personal life archive where every week gets a card. The roadmap moves from data foundation to visual identity (the 4000-week grid), to input (capture), to intelligence (AI synthesis), to emotional polish (onboarding and export). Each phase delivers a complete, verifiable capability -- the app is usable after Phase 3, differentiated after Phase 4, and compelling after Phase 5.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Data Foundation** - Local-first storage layer, week math, and project scaffolding
- [x] **Phase 2: Grid and Card Views** - Virtualized 4000-week grid and week card with front/back flip
- [ ] **Phase 3: Capture** - Chat-style quick input and longer reflections with persistence
- [ ] **Phase 4: AI Synthesis** - Claude-powered week headlines and curated highlights
- [ ] **Phase 5: Onboarding and Polish** - First-run experience, data export, and theming

## Phase Details

### Phase 1: Data Foundation
**Goal**: Users have a working app shell with reliable local storage that persists their data across sessions
**Depends on**: Nothing (first phase)
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-05, UX-03, UX-04
**Success Criteria** (what must be TRUE):
  1. App loads in the browser with Next.js scaffolding, Tailwind styling, and shadcn/ui components working
  2. IndexedDB database is created on first visit with separate stores for entries, weeks, syntheses, and settings
  3. Data persists across page refreshes and browser restarts (navigator.storage.persist() called)
  4. Week calculation correctly maps any date to its Sunday-to-Saturday week number, with founder's timeline starting at Week 943
  5. All records use UUIDs, timestamps, and deviceId fields (sync-ready data model)
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md — Project scaffolding + Dexie database schema with 4 stores and persistence protection
- [ ] 01-02-PLAN.md — Week calculation utilities (TDD) + app shell page proving data layer works

### Phase 2: Grid and Card Views
**Goal**: Users can browse their entire life as a visual grid and view any week as a flippable card
**Depends on**: Phase 1
**Requirements**: GRID-01, GRID-02, GRID-03, GRID-04, GRID-05, GRID-06, CARD-02, CARD-05, CARD-06
**Success Criteria** (what must be TRUE):
  1. User sees a 4000-week grid that renders without scroll jank on desktop and mobile (virtualized, under 200 DOM nodes)
  2. Each week cell is color-coded by state: empty, has-captures, AI-synthesized, and current week is visually highlighted
  3. User can click any week cell to open a card detail view with a flip animation between front and back
  4. Card front shows the week number (gracefully degrades when no AI headline exists); card back shows raw captures with timestamps
  5. Grid layout is responsive and functional on mobile browsers
**Plans**: 2 plans

Plans:
- [ ] 02-01-PLAN.md — Virtualized 4000-week grid with TanStack Virtual, color-coded cells, responsive layout, and current week highlight
- [ ] 02-02-PLAN.md — Week card detail view with 3D flip animation (Motion), front/back faces, and overlay wiring

### Phase 3: Capture
**Goal**: Users can record thoughts during their current week via quick chat-style input and longer reflections
**Depends on**: Phase 2
**Requirements**: CAPT-01, CAPT-02, CAPT-03, CAPT-04, CAPT-05
**Success Criteria** (what must be TRUE):
  1. User can type a quick thought in a chat-style input and see it appear immediately with an automatic timestamp
  2. User can write a longer reflection in a dedicated space (distinct from quick capture)
  3. Captures autosave to IndexedDB -- closing the browser and reopening preserves all entries
  4. Grid cells update in real-time when captures are added (empty cell becomes has-captures state)
**Plans**: 2 plans

Plans:
- [ ] 03-01-PLAN.md — Chat-style quick capture with auto-timestamps and IndexedDB persistence
- [ ] 03-02-PLAN.md — Reflection editor with autosave draft, capture mode toggle, and grid real-time updates

### Phase 4: AI Synthesis
**Goal**: Users can transform their raw week captures into a polished card with an AI-generated headline and curated highlights
**Depends on**: Phase 3
**Requirements**: AI-01, AI-02, AI-03, AI-04, AI-05, AI-06, CARD-01, CARD-03, CARD-04
**Success Criteria** (what must be TRUE):
  1. User can trigger AI synthesis for any week that has captures, and the result streams back visibly in real-time
  2. AI generates a card-native headline (short, evocative title like "Week 943: Naval & Rebranding") displayed on the card front
  3. AI generates curated highlights (key themes and moments) displayed on the card back
  4. User can toggle between Raw captures view and AI-synthesized view on the card back
  5. API key is never exposed to the browser (all Claude calls go through a server-side proxy with cost controls)
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

### Phase 5: Onboarding and Polish
**Goal**: New users have an emotionally resonant first experience, and all users can export their data and choose their visual theme
**Depends on**: Phase 4
**Requirements**: UX-01, UX-02, DATA-04
**Success Criteria** (what must be TRUE):
  1. First-time user is asked for their birth date, sees the life grid revealed with emotional weight, and understands the 4000-week concept within 60 seconds
  2. User can export all their data as a JSON file for backup
  3. User can switch between dark and light mode, and the choice persists
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Data Foundation | 2/2 | Complete | 2026-03-02 |
| 2. Grid and Card Views | 2/2 | Complete | 2026-03-03 |
| 3. Capture | 0/? | Not started | - |
| 4. AI Synthesis | 0/? | Not started | - |
| 5. Onboarding and Polish | 0/? | Not started | - |
