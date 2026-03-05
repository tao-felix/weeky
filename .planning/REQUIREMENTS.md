# Requirements: Weeky

**Defined:** 2026-03-02
**Core Value:** Every week of your life deserves a card — quick capture in the moment, AI-synthesized reflection when you're ready.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Grid & Navigation

- [x] **GRID-01**: User can view a 4000-week grid showing all weeks of their life
- [x] **GRID-02**: Each week cell is color-coded by state (empty, has-captures, AI-synthesized, current week)
- [x] **GRID-03**: Current week is visually highlighted ("you are here" marker)
- [x] **GRID-04**: User can click any week cell to open the week card detail view
- [x] **GRID-05**: Grid is responsive and functional on mobile browsers
- [x] **GRID-06**: Grid renders performantly with virtualization (no scroll jank)

### Card Views

- [x] **CARD-01**: Week card front displays week number and AI-generated headline (e.g., "Week 943: Naval & Rebranding")
- [x] **CARD-02**: Week card back displays raw captures with timestamps
- [x] **CARD-03**: Week card back displays AI-synthesized highlights
- [x] **CARD-04**: User can toggle between Raw and AI views on card back
- [x] **CARD-05**: Card has flip animation between front and back (museum feel)
- [x] **CARD-06**: Card front gracefully degrades when no AI headline exists (shows "Week 943" only)

### Capture & Input

- [x] **CAPT-01**: User can quickly capture thoughts via chat-style input during current week
- [x] **CAPT-02**: Each capture is timestamped automatically
- [x] **CAPT-03**: User can write longer reflections in a dedicated space
- [x] **CAPT-04**: Captures autosave to prevent data loss
- [x] **CAPT-05**: Grid cells update in real-time when captures are added

### AI Synthesis

- [x] **AI-01**: User can trigger AI synthesis for any week with captures
- [x] **AI-02**: AI generates a card-native headline (short, evocative title for the week)
- [x] **AI-03**: AI generates curated highlights (key themes/moments from captures)
- [x] **AI-04**: AI synthesis streams back in real-time (visible progress)
- [x] **AI-05**: AI API key is never exposed to the client (server-side proxy)
- [x] **AI-06**: AI costs are controlled (Haiku model, prompt caching, token limits)

### Data & Storage

- [x] **DATA-01**: All data stored locally in IndexedDB via Dexie.js (no account required)
- [x] **DATA-02**: Data model uses UUIDs, timestamps, and deviceId (sync-ready for future)
- [x] **DATA-03**: Safari IndexedDB eviction protection via navigator.storage.persist()
- [ ] **DATA-04**: User can export all data as JSON for backup
- [x] **DATA-05**: Entries and syntheses stored in separate IndexedDB stores

### Onboarding & Polish

- [ ] **UX-01**: First-run asks for start date and reveals the life grid with emotional weight
- [ ] **UX-02**: Dark and light mode support
- [x] **UX-03**: Week runs Sunday to Saturday
- [x] **UX-04**: Founder's timeline starts at Week 943 (2025-07-20)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Cloud & Sync

- **SYNC-01**: User can sign up with Supabase Auth
- **SYNC-02**: Local data syncs to cloud when signed in
- **SYNC-03**: Data accessible across devices

### Advanced Features

- **ADV-01**: Cross-week threads tracking themes across weeks
- **ADV-02**: AI-generated illustration on card front
- **ADV-03**: Backfill UX for past 942 weeks
- **ADV-04**: Suggestion system (random serendipity)
- **ADV-05**: Search across all weeks (full-text, later semantic)
- **ADV-06**: Photo attachment support in captures
- **ADV-07**: External data source integration (calendar sync)
- **ADV-08**: Physical card/magazine printing
- **ADV-09**: Weekly reminder nudge (browser notifications)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Daily note granularity | Undermines weekly unit — the core concept |
| AI chatbot / conversational AI | Weeky is an archivist, not a therapist |
| Mood charts / habit tracking | Clinical feel contradicts warm museum vibe |
| Gamification / streaks | Creates guilt, contradicts no-pressure archive |
| Real-time AI during writing | Interrupts authentic capture flow |
| Social sharing / shared journals | Changes what people write (performance vs authenticity) |
| Auto-import from social media | Floods with low-signal content, fragile APIs |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| GRID-01 | Phase 2 | Complete |
| GRID-02 | Phase 2 | Complete |
| GRID-03 | Phase 2 | Complete |
| GRID-04 | Phase 2 | Complete |
| GRID-05 | Phase 2 | Complete |
| GRID-06 | Phase 2 | Complete |
| CARD-01 | Phase 4 | Complete |
| CARD-02 | Phase 2 | Complete |
| CARD-03 | Phase 4 | Complete |
| CARD-04 | Phase 4 | Complete |
| CARD-05 | Phase 2 | Complete |
| CARD-06 | Phase 2 | Complete |
| CAPT-01 | Phase 3 | Complete |
| CAPT-02 | Phase 3 | Complete |
| CAPT-03 | Phase 3 | Complete |
| CAPT-04 | Phase 3 | Complete |
| CAPT-05 | Phase 3 | Complete |
| AI-01 | Phase 4 | Complete |
| AI-02 | Phase 4 | Complete |
| AI-03 | Phase 4 | Complete |
| AI-04 | Phase 4 | Complete |
| AI-05 | Phase 4 | Complete |
| AI-06 | Phase 4 | Complete |
| DATA-01 | Phase 1 | Complete |
| DATA-02 | Phase 1 | Complete |
| DATA-03 | Phase 1 | Complete |
| DATA-04 | Phase 5 | Pending |
| DATA-05 | Phase 1 | Complete |
| UX-01 | Phase 5 | Pending |
| UX-02 | Phase 5 | Pending |
| UX-03 | Phase 1 | Complete |
| UX-04 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 32 total
- Mapped to phases: 32
- Unmapped: 0

---
*Requirements defined: 2026-03-02*
*Last updated: 2026-03-02 after roadmap creation*
