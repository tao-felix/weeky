# Weeky

## What This Is

A personal life archive app built around the concept that life is roughly 4000 weeks (age 18 to 95). Users record, reflect on, and browse their life week by week — creating a warm personal museum over time. Each week is a "card" with an AI-generated headline and curated highlights. Inspired by *Four Thousand Weeks* by Oliver Burkeman.

## Core Value

Every week of your life deserves a card — quick capture in the moment, AI-synthesized reflection when you're ready.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] 4000-week grid view for browsing all weeks of life
- [ ] Week card with front (week number + AI headline) and back (records + synthesis)
- [ ] Quick capture input — chat-style, drop thoughts anytime during the week
- [ ] Longer reflection space — optional journal-style writing
- [ ] AI synthesis — Claude generates card-native output (headline + curated highlights)
- [ ] Raw vs AI toggle — switch between original records and AI-synthesized view
- [ ] Local-first storage — works without account, data in browser
- [ ] Week runs Sunday to Saturday
- [ ] Founder's timeline starts at Week 943 (2025-07-20)

### Out of Scope

- Cross-week threads (Threads) — v2 feature, high complexity
- Suggestion system (random serendipity) — v2 feature
- AI-generated illustration on card front — v2, deferred from MVP
- Backfill UX for past 942 weeks — v2, core recording must work first
- Physical card/magazine printing — long-term vision
- External data source integration (calendar sync) — v2
- Supabase auth + cloud sync — v2, start local-first
- Mobile app — web-first

## Context

- Founder (Tao Fangbo) has been tracking weeks since Week 943 (2025-07-20)
- Existing week notes: Week 943 (Naval, Rebranding), Week 944 (Facebook path, Context Engineering), Week 945 (Desire is a Contract, influence leverage, Naval)
- The "archive museum" feeling is more important than urgency — browsing past weeks should feel warm and rich
- Card front = "Week 943: Naval & Rebranding" style — AI-generated headline that captures the essence
- Card back = raw records + AI-synthesized highlights in card-native format
- Input is mixed: quick chat-like capture for in-the-moment thoughts + optional longer reflection area
- Un-recorded weeks in the grid should be visually distinct but not prescriptive (flexible styling)

## Constraints

- **Tech stack**: Next.js + Vercel (frontend/deploy), Supabase (future backend), Claude API (AI synthesis)
- **Storage**: Local-first (localStorage/IndexedDB) for MVP — no server dependency
- **AI**: Claude API for week synthesis — card-native output format (headline + highlights)
- **Week definition**: Sunday to Saturday, aligned with founder's existing tracking

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Local-first MVP | Reduce initial complexity, ship faster, add auth later | — Pending |
| AI headline on card front | Each week gets a memorable title — makes browsing feel like a magazine | — Pending |
| Defer illustration to v2 | Image generation adds complexity, headline + color sufficient for MVP | — Pending |
| Card-native AI output | Structured for the card format, not free-form essays | — Pending |
| Sunday-to-Saturday weeks | Matches founder's existing tracking convention | — Pending |

---
*Last updated: 2025-03-02 after initialization*
