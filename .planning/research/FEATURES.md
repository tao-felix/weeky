# Feature Research

**Domain:** Week-based personal life journaling / archiving app
**Researched:** 2026-03-02
**Confidence:** MEDIUM-HIGH (strong competitor landscape data; some features are novel to Weeky's specific niche so less comparable evidence exists)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Text entry / capture** | Every journaling app has this. Users cannot journal without it. | LOW | Chat-style quick capture (Weeky's approach) is a valid form. Must support at minimum plain text with basic formatting. |
| **Date-based organization** | Users expect entries tied to dates. Day One, Reflectly, Daylio all organize by date. | LOW | Weeky organizes by week, not day -- but within a week, entries should still have timestamps. |
| **Persistent local storage** | Data must survive page refreshes. Users will not re-enter lost data. | LOW | IndexedDB for structured data. localStorage alone is insufficient for media. |
| **Search / find past entries** | Every journaling app with more than a few entries needs search. Day One, Journey, Obsidian all have full-text search. | MEDIUM | Can be simple text search for MVP. AI-powered semantic search is a differentiator (v2). |
| **Visual timeline / grid navigation** | Life calendar apps (Life Calendar, Lifee Calendar, Life in Weeks) all provide a grid. Weeky's 4000-week grid is the core navigation. | MEDIUM | The grid IS the product. Must render performantly (4000+ cells). Color coding for filled vs empty weeks. |
| **Data export** | Users expect to get their data out. Day One exports to PDF/JSON, Diarly exports Markdown/PDF/RTF, Journey exports PDF/DOCX. Privacy-conscious users will not adopt without this. | MEDIUM | JSON export for MVP. PDF and Markdown are v1.x additions. Critical for trust in a local-first app. |
| **Responsive design (mobile-friendly)** | Day One, Rosebud, Reflectly are all mobile-first. Users will capture thoughts on their phone. | MEDIUM | Web-first but must work on mobile browsers. Grid may need a different layout on small screens (yearly view vs full grid). |
| **Basic media attachment (photos)** | Day One, Life Calendar, Journey all support photos in entries. A journaling app without photo support feels incomplete. | MEDIUM | Image upload stored in IndexedDB blobs. Avoid complex media pipelines for MVP -- single image per entry is sufficient. |
| **Week boundary clarity** | Users must know which week they're in, when it started, when it ends. All life calendar apps display this. | LOW | Sunday-to-Saturday per project spec. Show current week prominently. |
| **Reminders / nudges** | Day One, Life Calendar, Daylio, Reflectly all have reminders. Without nudges, users forget to journal and churn. | LOW | Browser notification API or simple in-app "you haven't captured anything this week" banner. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **AI-synthesized week card (headline + highlights)** | No competitor does this. Rosebud does AI conversation; Reflection.app does pattern detection; Mindsera does CBT reframing. But nobody takes a week of raw captures and produces a card-native summary with a headline like "Week 943: Naval & Rebranding". This is Weeky's core differentiator. | HIGH | Requires Claude API integration. Must handle: prompt engineering for card-native output, cost management (per-week synthesis), graceful degradation when API is unavailable. |
| **Dual-mode view (Raw vs AI)** | Unique to Weeky. Most AI journaling apps replace your input with AI output. Weeky preserves both -- the raw captures AND the synthesized card. Users can toggle between "what I actually said" and "the story of this week". Builds trust in AI. | MEDIUM | UI toggle on week card back. Both views must be stored. AI view is regeneratable from raw data. |
| **4000-week life grid as primary navigation** | Life Calendar (lifecal.me) and Life in Weeks (lifeweeks.app) have grids, but they are passive visualization tools. Weeky makes the grid the primary navigation interface WITH content behind each cell. The grid is not a poster -- it is a browsable archive. | MEDIUM | Performance challenge: rendering 4000+ interactive cells. Consider virtualization or canvas rendering. Color/state encoding (empty, has-data, current-week, AI-synthesized). |
| **"Museum browsing" feel** | No journaling app prioritizes the aesthetic of browsing past entries as a warm, curated experience. Day One has "On This Day" but it's nostalgia-driven, not archive-browsing. The museum metaphor -- flipping through your life's cards like browsing an exhibit -- is unique. | MEDIUM | Card flip animations, bento-grid layout for week detail, progressive reveal. UX/visual design is the differentiator here, not technical complexity. |
| **Chat-style quick capture** | Rosebud uses chat-style AI conversation for journaling, but Weeky's chat is for raw capture (you talk to yourself, not to an AI). Lower friction than a blank page. Scribble (micro-journal) is the closest analog but lacks the weekly synthesis step. | LOW | Simple input field with timestamp. Messages append to the current week's raw data. No AI needed at capture time. |
| **Week-as-card metaphor (front/back)** | Physical card metaphor: front = week number + AI headline (like a magazine cover), back = content (raw + synthesized). No competitor uses this metaphor. Most use timeline/feed or calendar views. | MEDIUM | Requires thoughtful card component design. Front must be visually striking with minimal info. Back must handle variable-length content. |
| **Local-first with optional cloud sync (future)** | Anytype and Obsidian have proven the local-first model. Day One and Journey are cloud-first. Being local-first with data sovereignty is increasingly valued (EU Data Act, GDPR trends). Most AI journaling apps send everything to the cloud. | LOW (MVP) / HIGH (sync) | IndexedDB for MVP is straightforward. CRDTs for future sync add significant complexity. Positioning: "your data never leaves your device unless you choose." |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems for Weeky specifically.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Daily note granularity** | Users trained by Day One / Obsidian daily notes expect per-day views. | Undermines the weekly unit, which is the core concept. Daily granularity turns Weeky into yet-another-journaling-app. The week as atomic unit IS the product. | Keep timestamped captures within a week, but the card/synthesis unit is always the week. No "Day view" mode. |
| **AI conversation / chatbot** | Rosebud's conversational AI is popular. Users may want to "talk to" Weeky. | Shifts the product from personal archive to AI therapy tool. Conversation requires always-on AI, increases cost, changes the relationship (AI as therapist vs AI as archivist). | AI is a synthesis engine, not a conversationalist. It reads your week and produces a card. One-directional: your captures in, card out. |
| **Mood tracking / emotion charts** | Daylio, Reflectly, and nearly every mental health journaling app has mood tracking with charts. | Adds a quantified-self dimension that conflicts with the "warm museum" metaphor. Mood charts feel clinical, not archival. Also adds significant UI complexity. | If mood is captured, it should be through the AI synthesis ("this week felt heavy") rather than a tap-to-rate widget. Let the AI infer tone from text. |
| **Habit tracking / goal setting** | Notion Life OS templates, Rosebud, and many planners bundle habit tracking. | Weeky is a backward-looking archive, not a forward-looking planner. Habit tracking requires daily check-ins, which conflicts with the weekly rhythm. Scope creep into productivity tools. | Stay firmly in the "reflection and archive" lane. Weeky is about remembering, not optimizing. |
| **Social sharing / shared journals** | Day One has Shared Journals. Social features are frequently requested. | Journaling is deeply personal. Social features change what people write (performance vs authenticity). Also adds auth, permissions, moderation complexity. | Keep it single-user. If sharing is ever added, it should be "export a card as an image" not "invite collaborators." |
| **Gamification (streaks, points, badges)** | Day One and Daylio use streaks. Streaks increase retention metrics. | Streaks create anxiety and guilt ("I broke my streak"). This contradicts the warm, no-pressure museum vibe. A missed week should feel like an empty frame in a gallery, not a failure. | Gentle visual cues: empty weeks in the grid are visible but not punitive. "You have 3 un-recorded weeks" as information, not guilt. |
| **Real-time AI feedback during writing** | Reflection.app and Mindsera offer in-line AI responses as you write. | Interrupts the capture flow. The point of quick capture is speed and authenticity. AI watching you type changes what you write. Also increases API costs dramatically. | AI synthesis happens AFTER the week ends (or on-demand), not during capture. Separation of capture and reflection. |
| **Complex tag / folder / category systems** | Obsidian and Notion power users expect deep organizational structures. | Over-engineering organization for a weekly archive. You have at most ~4000 items (weeks), each with a natural date-based index. Complex taxonomies add friction to capture. | The grid IS the organization. Weeks are indexed by number and date. Simple keyword search covers the retrieval need. |
| **Automatic social media import** | Momento aggregates Twitter, Instagram, etc. Users may want auto-import. | Third-party API dependencies are fragile (Twitter API changes regularly). Auto-import floods entries with low-signal content. Changes the product from "intentional capture" to "automatic logging." | Keep capture intentional. If integration is ever added, make it pull-based (user selects what to import), not automatic. |

## Feature Dependencies

```
[Local Storage (IndexedDB)]
    └──requires──> [Text Capture]
                       └──enables──> [Week Card Back (raw view)]
                                         └──enables──> [AI Synthesis]
                                                            └──produces──> [Week Card Front (headline)]
                                                            └──produces──> [Week Card Back (AI view)]
                                                            └──enables──> [Raw vs AI Toggle]

[4000-Week Grid]
    └──requires──> [Local Storage]
    └──requires──> [Week Boundary Logic]
    └──enables──> [Grid Navigation → Week Card Detail]

[Search]
    └──requires──> [Local Storage]
    └──requires──> [Text Capture]

[Photo Attachment]
    └──requires──> [Local Storage (IndexedDB blobs)]
    └──enhances──> [Week Card Back]
    └──enhances──> [AI Synthesis (image context)]

[Data Export]
    └──requires──> [Local Storage]

[Reminders]
    └──independent── (browser notification API)
    └──enhances──> [Capture consistency]

[Responsive Mobile Layout]
    └──requires──> [4000-Week Grid (alternative mobile view)]
    └──requires──> [Quick Capture Input]
```

### Dependency Notes

- **AI Synthesis requires Text Capture + Local Storage:** Cannot synthesize a week without raw captures stored locally. This is the critical path: capture must work before AI is integrated.
- **Week Card Front requires AI Synthesis:** The headline is AI-generated. Without AI, the card front is just "Week 943" without a headline. This means the card front is a degraded experience pre-AI. Design the card front to work with AND without a headline.
- **4000-Week Grid requires Week Boundary Logic:** The grid must know how to map dates to week numbers relative to the user's birth date (or start date). This is foundational math that must be correct before the grid renders.
- **Raw vs AI Toggle requires both views to exist:** The toggle only makes sense once AI synthesis is working. It's a UI addition after AI is functional, not before.
- **Search enhances Grid Navigation:** Users can find weeks via search as an alternative to scrolling the grid. Search is a secondary navigation path.

## MVP Definition

### Launch With (v1)

Minimum viable product -- what's needed to validate the concept.

- [ ] **4000-week grid view** -- the core navigation and visual identity. Renders all weeks, highlights current week, visually distinguishes recorded vs empty weeks. This IS the product.
- [ ] **Quick capture (chat-style input)** -- timestamped text entries that append to the current week. Must be fast and frictionless. No formatting required.
- [ ] **Week card detail view** -- tap a week in the grid to see its content. Shows raw captures in chronological order. Card front shows week number + date range (headline placeholder for pre-AI).
- [ ] **Local storage (IndexedDB)** -- all data persists in the browser. No account required. No server.
- [ ] **AI synthesis (one week at a time)** -- user triggers synthesis for a week. Claude API generates headline + highlights in card-native format. Stored alongside raw data.
- [ ] **Raw vs AI toggle** -- switch between original captures and AI-synthesized view on the week card back.

### Add After Validation (v1.x)

Features to add once core is working and founder is using it daily.

- [ ] **Photo attachment** -- add images to captures. Trigger: founder wants to attach a photo and cannot.
- [ ] **Search** -- full-text search across all weeks. Trigger: more than ~20 recorded weeks make scrolling the grid insufficient.
- [ ] **Data export (JSON)** -- export all data for backup. Trigger: founder has enough data that losing it would be painful.
- [ ] **Longer reflection space** -- optional journal-style writing area per week, separate from quick captures. Trigger: founder wants to write a longer end-of-week reflection.
- [ ] **Reminders** -- browser notification to capture something this week. Trigger: founder notices weeks going unrecorded.
- [ ] **Responsive mobile layout** -- optimize grid and capture for phone browsers. Trigger: founder tries to use Weeky on phone and it's unusable.

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Cross-week threads** -- track a theme (e.g., "Naval influence") across multiple weeks. Why defer: requires tagging infrastructure and thread UI. HIGH complexity.
- [ ] **Backfill UX for past weeks** -- let users fill in historical weeks before they started using Weeky. Why defer: core recording must work first; backfill is a different UX flow.
- [ ] **Supabase auth + cloud sync** -- user accounts, cross-device sync. Why defer: local-first must prove the concept first. Sync adds auth, conflict resolution, and infrastructure cost.
- [ ] **AI-generated illustration on card front** -- image generation for each week's card. Why defer: adds image generation API cost, prompt engineering complexity, and storage burden.
- [ ] **External data source integration** -- calendar sync, photo library import. Why defer: third-party API integrations are maintenance-heavy and fragile.
- [ ] **Random serendipity / "On This Week"** -- surface a random past week for re-discovery. Why defer: requires sufficient recorded history to be meaningful.
- [ ] **Physical card / magazine printing** -- export weeks as printable cards or a bound book. Why defer: long-term vision, requires print-quality design and fulfillment.
- [ ] **Semantic search (AI-powered)** -- ask questions about your life in natural language. Why defer: requires embedding generation, vector storage, and higher API costs.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| 4000-week grid view | HIGH | MEDIUM | P1 |
| Quick capture (chat-style) | HIGH | LOW | P1 |
| Week card detail view | HIGH | MEDIUM | P1 |
| Local storage (IndexedDB) | HIGH | LOW | P1 |
| AI synthesis (headline + highlights) | HIGH | HIGH | P1 |
| Raw vs AI toggle | MEDIUM | LOW | P1 |
| Photo attachment | MEDIUM | MEDIUM | P2 |
| Full-text search | MEDIUM | MEDIUM | P2 |
| Data export (JSON) | MEDIUM | LOW | P2 |
| Longer reflection space | MEDIUM | LOW | P2 |
| Reminders | LOW | LOW | P2 |
| Responsive mobile layout | MEDIUM | MEDIUM | P2 |
| Cross-week threads | MEDIUM | HIGH | P3 |
| Backfill UX | MEDIUM | HIGH | P3 |
| Cloud sync (Supabase) | HIGH | HIGH | P3 |
| AI illustration on card front | LOW | HIGH | P3 |
| External data integration | LOW | HIGH | P3 |
| Serendipity / "On This Week" | LOW | LOW | P3 |
| Physical printing | LOW | HIGH | P3 |
| Semantic search | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Day One | Rosebud | Life Calendar (lifecal.me) | Life in Weeks | Obsidian (w/ plugins) | Weeky (Our Approach) |
|---------|---------|---------|---------------------------|---------------|----------------------|---------------------|
| **Time unit** | Daily entries | Per-session (conversational) | Weekly boxes | Weekly boxes | Daily notes (configurable) | Weekly (atomic unit) |
| **Input style** | Rich text editor | AI chat conversation | Short notes per week | Color coding + labels | Markdown editor | Chat-style quick capture |
| **AI integration** | Journaling Assistant (prompts, 2026) | Core product (conversational AI) | None | None | Via plugins/manual | Synthesis engine (headline + highlights) |
| **Grid / calendar view** | Calendar + "On This Day" | None | Life-in-weeks grid | Life-in-weeks grid | Calendar via plugins | 4000-week interactive grid |
| **Content per time unit** | Unlimited rich entries | AI-guided conversation log | 3 cards (free) / unlimited (pro) | Color + label only | Unlimited markdown | Unlimited quick captures + AI synthesis |
| **Local-first** | No (cloud-first) | No (cloud-first) | Yes (mobile app) | Yes (web, limited) | Yes (vault on disk) | Yes (IndexedDB) |
| **Photo support** | Yes (rich media) | Limited | Yes (1 per card) | No | Yes (embed in markdown) | Yes (v1.x) |
| **Data export** | PDF, JSON, printed books | Limited | Text file only | None | Native (markdown files) | JSON (v1.x), PDF (v2) |
| **Pricing** | Free tier + $35/year | Free tier + $13/month | Free + $2/month or $16/year | Free | Free (open source) | Free (local-first, no server cost for MVP) |
| **Unique strength** | Mature ecosystem, media richness, printed books | AI conversation depth, pattern recognition | Week-as-unit with notes/mood/images | Simple visual life map | Extensibility, local ownership, linking | AI-synthesized week cards, museum browsing, 4000-week archive |

## Sources

- Day One official site and App Store listings (dayoneapp.com)
- Rosebud official site (rosebud.app) and TechCrunch coverage of $6M seed round
- Life Calendar (lifecal.me) features and premium pages
- Life in Weeks (lifeweeks.app)
- Lifee Calendar (lifeecalendar.com)
- The Lifespan Tracker (thelifespantracker.com)
- Reflection.app AI journaling comparison and feature pages
- Mindsera (mindsera.com) AI journaling features
- Obsidian Periodic Notes plugin (github.com/liamcain/obsidian-periodic-notes) and Journals plugin
- Scribble micro-journal (App Store)
- Daylio mood tracking (App Store / Google Play)
- Momento (momentoapp.com) automatic life logging
- Diarly export features (diarly.app)
- Journey (journey.cloud) PDF export and printing
- Ink & Switch "Local-first software" essay (inkandswitch.com)
- Wait But Why "Your Life in Weeks" (waitbutwhy.com)
- Card UI design patterns: Eleken, Justinmind, ALF Design Group guides
- Notion life planner and journaling templates (notion.com/templates, notioneverything.com, super.so)
- 2026 journaling app comparison guides (reflection.app, holstee.com, journaling.guide, mylifenote.ai, aijournalapp.ai)

---
*Feature research for: Week-based personal life journaling / archiving*
*Researched: 2026-03-02*
