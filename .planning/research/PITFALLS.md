# Pitfalls Research

**Domain:** Week-based life journaling / personal archive web app (local-first, AI-synthesized)
**Researched:** 2026-03-02
**Confidence:** HIGH (multiple verified sources across each domain)

---

## Critical Pitfalls

### Pitfall 1: Safari IndexedDB Eviction Destroys User's Life Archive

**What goes wrong:**
Safari's Intelligent Tracking Prevention (ITP) deletes all IndexedDB and localStorage data for origins that haven't received user interaction (click/tap) within 7 days of browser use. For a weekly journaling app where users may only write once a week, a user who skips a week or uses Safari infrequently will lose their entire life archive silently. This is not a theoretical risk -- it is documented behavior in all WebKit-based browsers, and on iOS all browsers use WebKit (except in the EU since iOS 17.4).

**Why it happens:**
Developers test on Chrome where IndexedDB is more durable and assume cross-browser parity. Safari treats client-side storage as a disposable cache, not a durable data store. The 7-day window is particularly dangerous for a weekly journaling cadence.

**How to avoid:**
- Request persistent storage via `navigator.storage.persist()` at first launch. Safari may auto-approve based on engagement signals but is not guaranteed.
- Design the data model from day one with an export-to-JSON/Markdown escape hatch so users can back up manually before cloud sync exists.
- Display a clear "your data is stored locally" warning banner on Safari, with a prompt to add the app as a PWA (home screen PWAs are exempt from ITP eviction).
- Prioritize cloud sync (Supabase) in v2 earlier than planned if Safari usage is significant in analytics.
- Implement an `onbeforeunload`-style periodic reminder: "Back up your data" if last export was > 2 weeks ago.

**Warning signs:**
- Bug reports from Safari/iOS users saying "all my entries disappeared"
- QA testing only on Chrome/Firefox
- No `navigator.storage.persist()` call in codebase
- No data export feature in MVP

**Phase to address:**
Phase 1 (MVP). The export/backup feature and persist() call must ship with the first local-first release. Without them, a single Safari user losing their journal is a trust-destroying event.

---

### Pitfall 2: Data Model Not Designed for Future Sync

**What goes wrong:**
The local-first data model stores week entries in IndexedDB without sync metadata (timestamps, conflict markers, unique IDs). When v2 adds Supabase cloud sync, the migration becomes a rewrite: existing user data lacks the fields needed for conflict resolution, and the schema doesn't match what a sync engine requires. Users who adopted the app early face a painful migration or data loss.

**Why it happens:**
"We'll figure out sync later" is a common local-first trap. The data model is designed for single-device reads/writes only, with auto-increment IDs and no concept of `createdAt`, `updatedAt`, `syncedAt`, or `deviceId`. CRDTs and sync engines need per-field or per-row change tracking that must be baked in from the start.

**How to avoid:**
- Use UUIDs (not auto-increment) for all record IDs from day one.
- Include `createdAt`, `updatedAt`, and `deviceId` fields on every record, even before sync exists.
- Structure the schema to separate the week container (weekNumber, startDate, endDate) from entries within a week (individual captures, reflections) so that sync can merge at the entry level, not the week level.
- Choose a serialization format (JSON) that can round-trip cleanly between IndexedDB and Supabase/Postgres.
- Keep a schema version number in the local database so future migrations can detect and transform old data.

**Warning signs:**
- Auto-increment integer IDs in IndexedDB
- No timestamp fields on records
- Week data stored as a single blob rather than normalized entries
- No schema version tracking

**Phase to address:**
Phase 1 (MVP data model design). The cost of adding sync metadata in Phase 1 is near-zero. The cost of retrofitting it in Phase 3+ is enormous.

---

### Pitfall 3: The 4000-Cell Grid Kills Performance Without Virtualization

**What goes wrong:**
The 4000-week life grid renders all ~4000 DOM elements at once. On initial load or navigation to the grid view, the browser freezes for 1-3 seconds. Scrolling stutters. Mobile devices become unresponsive. Users perceive the app as broken on their first interaction with the signature feature.

**Why it happens:**
4000 small grid cells seem trivial compared to "big data" tables, so developers skip virtualization. But each cell may include conditional styling (recorded vs. empty, current week highlight, hover state), and React reconciliation of 4000+ elements with state-dependent rendering is expensive. The problem compounds on low-end devices and mobile browsers.

**How to avoid:**
- Use CSS Grid for layout but implement viewport-aware rendering: only render cells visible in the viewport plus a buffer zone. TanStack Virtual handles grids of 1M+ cells at 60fps and is the right tool here.
- For the life grid specifically, consider a hybrid approach: render a lightweight "minimap" (pure CSS/canvas, no React per-cell) for the zoomed-out view, and virtualize a detailed view when the user zooms in or scrolls to a region.
- Memoize cell components aggressively with `React.memo` -- a cell's visual state only changes when its week data changes.
- Measure performance on a throttled CPU (Chrome DevTools 4x slowdown) during development, not just on a fast MacBook.
- Avoid inline styles per cell; use CSS classes with data attributes for state-dependent styling.

**Warning signs:**
- Grid view renders all 4000 `<div>` elements on mount (inspect DOM count)
- Time to Interactive > 1 second on grid view
- Scroll jank visible on mobile or throttled desktop
- No virtualization library in dependencies

**Phase to address:**
Phase 1 (Grid view implementation). The grid is the hero feature. If it stutters on first use, the product fails its first impression.

---

### Pitfall 4: AI Synthesis Costs Spiral Out of Control

**What goes wrong:**
Each week synthesis sends the user's raw journal entries to Claude API, receives a headline + highlights response. Without cost controls, a user who writes extensively (2000+ words/week) combined with re-generation attempts ("try again", "different tone") can cost $0.50-$2.00 per synthesis on Sonnet, or $5+ on Opus. At 100 users generating 4 syntheses/month each, monthly AI costs reach $200-$800 -- unsustainable for a free/early-stage product.

**Why it happens:**
AI API pricing is per-token, and developers underestimate how quickly costs accumulate when both input (user's journal text + system prompt) and output (structured synthesis) tokens add up. Output tokens cost 3-5x more than input tokens. Extended thinking features and verbose system prompts compound the problem. There is no natural cost ceiling without explicit engineering.

**How to avoid:**
- Use Claude Haiku for synthesis (not Sonnet/Opus). Haiku at $1/$5 per MTok is 3-15x cheaper and sufficient for structured summarization.
- Implement prompt caching: the system prompt (synthesis instructions, output format) is identical across all users and should be cached (90% cost reduction on cached tokens, 1-hour TTL).
- Set a hard token budget per synthesis: cap input context at ~2000 tokens (roughly 1500 words of journal text) and output at ~500 tokens. Truncate or summarize long entries client-side before sending.
- Rate-limit synthesis: max 2 regenerations per week per user. Cache the first successful synthesis result.
- Use structured output mode to avoid verbose, meandering AI responses.
- Track per-user token consumption and set alerts at cost thresholds.
- Consider batching synthesis requests during off-peak hours using Anthropic's Batch API (50% discount).

**Warning signs:**
- No per-user rate limiting on AI synthesis
- Using Opus/Sonnet when Haiku suffices
- System prompt not cached
- No output token limit in API calls
- AI costs growing faster than user count

**Phase to address:**
Phase 2 (AI synthesis feature). Must be designed with cost constraints from the first API call. Retrofitting cost controls after launch means existing users expect unlimited regeneration.

---

### Pitfall 5: Journaling Retention Cliff -- Users Abandon After Week 2

**What goes wrong:**
Research shows life-tracking and journaling apps have among the worst retention rates of any app category: median 15-day retention is 3.9%. Over 80% of users vanish between days 1 and 10. The root causes are roughly 40% UX problems, 35% content inadequacy, and 25% design flaws. A weekly journaling app has an even harder retention challenge because the natural engagement cadence is only once per week -- there are 6 days between uses where the user can forget the app exists.

**Why it happens:**
Users download during a moment of motivation (New Year's, reading *Four Thousand Weeks*) but the motivation fades. The blank page problem creates friction: opening the app to an empty capture box with no guidance triggers avoidance. The value proposition (a rich life archive) only materializes after months of consistent use, but the user judges the app's worth in the first 2-3 sessions.

**How to avoid:**
- The onboarding flow must deliver value within 60 seconds: show the user their life grid with their birth date already mapped, highlight "you are here" in week N, and let them feel the emotional weight of 4000 weeks before asking them to write anything.
- Provide gentle starter prompts for capture ("What's one thing you'll remember from this week?") rather than a blank text box. Make prompts optional, not mandatory.
- The AI synthesis should produce a compelling card from even minimal input (a single sentence). Show the user what their card looks like after entering just one thought -- immediate visual reward.
- Implement a weekly "nudge" mechanism: a browser notification or email reminder at the end of the week (Saturday) saying "Week 967 is closing -- capture a thought?"
- Populate the grid with emotional resonance: show "un-recorded weeks" as faded but not empty -- label them with the date range so the user feels the passage of time, not guilt about missing entries.
- Do NOT require account creation before showing value. Local-first is an advantage here.

**Warning signs:**
- First-time user sees a blank capture box with no guidance
- No visual payoff (card preview) until the user has written substantial content
- Grid shows empty weeks as identical blank squares with no emotional weight
- No re-engagement mechanism (notifications, reminders)
- Onboarding asks for birth date without explaining why it matters

**Phase to address:**
Phase 1 (UX design) and ongoing. The onboarding experience and empty-state design are as important as the core capture feature. This is the #1 reason journaling apps fail.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Store week data as a single JSON blob per week | Simpler read/write, one IndexedDB key per week | Cannot sync individual entries, cannot query across weeks, full-blob rewrites on any edit | Never -- normalize from the start |
| Skip `navigator.storage.persist()` | No async permission flow to handle | Silent data loss on Safari after 7 days of inactivity | Never for a journaling app |
| Hardcode Claude model version (e.g., `claude-sonnet-4-5-20241022`) | Works now without abstraction | Model deprecated in 3-6 months, synthesis breaks until code updated. Anthropic retired all Claude 3.x within 3 months | Never -- use a config constant or latest-alias with version pinning |
| Use `localStorage` instead of `IndexedDB` | Simpler API, synchronous reads | 5-10MB limit (can't store months of entries + AI outputs), blocks main thread, no structured queries | Only for tiny metadata (settings, last-opened week) |
| Render AI synthesis on every card open | Simple, no caching logic | Redundant API calls, costs multiply, slower card opens | Never -- cache synthesis result per week version |
| Skip TypeScript on IndexedDB layer | Faster prototyping | Schema drift between what code expects and what DB stores causes silent bugs at runtime | Only in throwaway prototypes |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Claude API (synthesis) | Exposing API key in client-side code. Next.js client components can't safely hold secrets | Route all Claude API calls through Next.js API routes (server-side). Store API key in environment variables, never in client bundle |
| Claude API (streaming) | Waiting for full response before showing synthesis to user, creating a "dead screen" feeling | Use Server-Sent Events (SSE) streaming from Next.js API route to client. Show headline first, then highlights progressively |
| Claude API (model lifecycle) | Pinning to a specific model version and forgetting about it. Anthropic deprecates models in 3-6 months | Abstract model selection behind a config. Monitor Anthropic's deprecation notices. Test against new model versions before they become required |
| IndexedDB | Using the raw IndexedDB API, leading to verbose callback-hell code and missing edge cases | Use a wrapper library (Dexie.js or idb) that provides Promise-based APIs, schema versioning, and migration support |
| Vercel deployment | Setting environment variables (Claude API key) only in Vercel dashboard, then forgetting to update them or losing track | Manage environment variables via GitHub config files (per project CLAUDE.md instructions). Keep a `.env.example` in the repo |
| Supabase (future sync) | Designing the Supabase schema independently from the local IndexedDB schema, creating a translation layer nightmare | Define a single canonical schema (TypeScript types) shared between client IndexedDB operations and future Supabase tables |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Rendering 4000 grid cells as individual React components without virtualization | First paint > 2s, scroll jank, high memory on mobile | TanStack Virtual or CSS-only minimap for zoomed-out view | Immediately on any device. 4000 DOM nodes with React state is heavy |
| Storing AI synthesis output in the same IndexedDB record as raw entries | Read latency increases as synthesis output (500-1000 tokens) is loaded every time raw entries are read | Separate IndexedDB object stores: `entries` (raw captures) and `syntheses` (AI output, keyed by weekId + version) | At ~50 weeks of data, read latency for entry list becomes noticeable |
| Loading all week data on grid view to show "recorded vs empty" indicators | Grid view fetches every entry to determine which weeks have content | Maintain a lightweight index/bitmap: a simple object mapping weekNumber -> boolean (hasEntries). Update it on write, read it for grid rendering | At 100+ weeks of data (2+ years of use) |
| Re-running AI synthesis every time user toggles "raw vs AI" view | Unnecessary API calls, latency on toggle, cost waste | Cache synthesis result locally. Only re-synthesize if raw entries have changed since last synthesis (compare `updatedAt` timestamps) | Immediately if toggle is used more than once per session |
| No debounce on quick-capture autosave | IndexedDB writes on every keystroke, potential write contention across tabs | Debounce autosave to 1-2 second intervals. Use a single write transaction per save, not per field | At normal typing speed, especially on mobile |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storing Claude API key in client-side JavaScript or Next.js client component | Key exposed in browser DevTools, anyone can use it to make API calls on your account | Server-side only: Next.js API routes or server actions. Never import API key in any file that runs in the browser |
| No content sanitization on AI-generated synthesis displayed in the UI | If AI output contains HTML/script (unlikely but possible with adversarial input), XSS risk when rendering | Always render AI output as plain text or sanitized Markdown. Use a safe Markdown renderer (e.g., react-markdown with rehype-sanitize) |
| Journal entries stored unencrypted in IndexedDB | Anyone with physical access to the device can read deeply personal journal content via DevTools | For MVP, accept this trade-off but document it clearly ("your data is as private as your browser"). For v2, consider Web Crypto API encryption at rest with a user-derived key |
| No rate limiting on the synthesis API route | An attacker or script can spam the endpoint, running up Claude API costs | Implement rate limiting on the Next.js API route (e.g., max 10 requests/minute per IP). Consider requiring a lightweight auth token even before full auth exists |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Blank capture box with no guidance | "I don't know what to write" paralysis. User closes app, never returns | Provide optional starter prompts ("What's one moment from this week?"). Show them as placeholder text or subtle suggestions, not mandatory fields |
| AI synthesis that feels generic or robotic | User doesn't recognize their own life in the synthesis. Breaks the "personal museum" feeling | Tune prompts to reflect the user's voice. Include specific details from their entries (names, places, emotions). Shorter, punchier headlines beat verbose summaries |
| Grid shows un-recorded weeks as guilt-inducing empty squares | User feels behind, ashamed of gaps. Emotional negative association with the app | Show un-recorded weeks as soft, faded cells with the date range visible. Avoid "0 entries" labels. Frame gaps as natural, not as failures |
| Forcing birth date entry before any value is shown | Onboarding friction. "Why does this app need my birthday?" suspicion | Explain clearly: "This maps your 4000 weeks" with a visual preview of the grid. Allow skipping with a default (age 25 as starting point). Let users set it later |
| "Raw vs AI" toggle that confuses users about where their data is | "Did the AI change my entry? Is my original text gone?" anxiety | Clearly label: "Your original" and "AI summary". Never modify original entries. Show them side by side or as clearly distinct tabs with reassuring copy |
| Week boundary confusion (Sunday-to-Saturday) | User writes on Sunday night, entry appears in "next week" unexpectedly | Show the current week's date range prominently on the capture screen. Allow entries to be moved between weeks if the user disagrees with automatic placement |
| Notification fatigue from weekly reminders | User disables all notifications, loses the re-engagement channel entirely | Start with a single, gentle end-of-week reminder (Saturday afternoon). Let users choose timing. Never send more than one reminder per week. Respect "don't remind me" permanently |

## "Looks Done But Isn't" Checklist

- [ ] **Grid view:** Renders beautifully on desktop but check mobile viewport -- 4000 tiny cells may need a completely different layout (e.g., year-by-year accordion) on screens < 768px
- [ ] **Quick capture:** Text input works but verify autosave actually persists to IndexedDB (not just React state). Kill the tab and reopen to confirm
- [ ] **AI synthesis:** Returns a headline but verify it handles edge cases: empty week (no entries), single-word entry, entries with only emoji, entries in non-English languages
- [ ] **Local storage:** Works on Chrome but test on Safari (7-day eviction), Firefox (different quota behavior), and iOS Safari (WebKit constraints). `navigator.storage.persist()` must be called
- [ ] **Week boundaries:** Display says "Week 943" but verify the date math is correct for edge cases: leap years, DST transitions, year boundaries (Dec 31 / Jan 1 week split)
- [ ] **Data export:** "Export" button exists but verify the exported JSON/Markdown can actually be re-imported or is at least human-readable and complete (includes both raw entries and AI syntheses)
- [ ] **Offline behavior:** App loads offline (service worker cached) but verify that writes made offline actually persist and don't silently fail
- [ ] **Card flip animation:** Looks smooth but check if it triggers full re-render of card content. Measure whether the back-side content (entries + synthesis) is pre-loaded or fetched on flip

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Safari data eviction (user lost entries) | HIGH | No recovery without cloud sync. Offer sincere apology + fast-track cloud sync. Add data export feature immediately. Consider offering manual re-entry assistance |
| Data model lacks sync fields | MEDIUM | Write a one-time IndexedDB migration that adds UUID, timestamps, and deviceId to all existing records. Requires careful testing to avoid corrupting existing data |
| Grid performance (no virtualization) | LOW | Swap bare `<div>` grid for TanStack Virtual. The component API change is localized to the grid view. May require layout refactoring if CSS assumptions change |
| AI costs out of control | LOW | Switch model from Sonnet/Opus to Haiku. Add prompt caching. Implement rate limits. Changes are server-side only, no client impact |
| User retention cliff | HIGH | Redesigning onboarding and empty states after launch means existing users already formed negative impressions. A/B test new onboarding flows. Add prompts, nudges, and card previews retroactively |
| Claude model deprecated | LOW | Update model string in config. Test synthesis quality with new model. If quality degrades, adjust prompts. Ship as a config change, no major code changes |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Safari IndexedDB eviction | Phase 1 (MVP) | Test on Safari: write entries, wait 8+ days without visiting, check data persists. Verify `persist()` is called. Verify export feature works |
| Data model not sync-ready | Phase 1 (Data model design) | Schema review: all records have UUID, createdAt, updatedAt, deviceId. Week and entry are separate stores. Schema version is tracked |
| Grid performance | Phase 1 (Grid implementation) | Lighthouse performance audit on grid view. DOM node count < 200 in viewport. Time to Interactive < 1.5s on 4x CPU throttle |
| AI cost spiral | Phase 2 (AI synthesis) | Cost projection spreadsheet before launch: model, avg tokens per synthesis, projected users, monthly cost. Rate limits configured. Prompt caching enabled |
| Retention cliff | Phase 1 (UX/onboarding) | User test with 5 people who have never seen the app. Measure: do they complete first capture? Do they return in week 2? Identify where they hesitate or drop off |
| Blank page UX problem | Phase 1 (Capture feature) | First-time user flow test: open capture, is there a prompt/placeholder? Is the text box inviting or intimidating? Does minimal input produce a satisfying card? |
| API key exposure | Phase 2 (AI integration) | Code review: search codebase for API key strings in any file imported by client components. Verify all Claude calls go through API routes |
| Model deprecation | Phase 2 (AI integration) | Model version is a config constant, not hardcoded in prompt logic. Deprecation monitoring is part of the operational checklist |
| Week boundary edge cases | Phase 1 (Data model) | Unit tests for: week containing Jan 1, week during DST change, leap year week, week starting on different days. Date math uses a well-tested library (date-fns or Temporal API) |

## Sources

- [RxDB: Downsides of Offline First](https://rxdb.info/downsides-of-offline-first.html) -- comprehensive catalog of local-first limitations
- [WebKit: Updates to Storage Policy](https://webkit.org/blog/14403/updates-to-storage-policy/) -- Safari 17+ storage quotas and eviction rules (HIGH confidence, official source)
- [MDN: Storage Quotas and Eviction Criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) -- cross-browser eviction policies (HIGH confidence)
- [WebKit Bug 266559: Safari periodically erasing IndexedDB](https://bugs.webkit.org/show_bug.cgi?id=266559) -- documented Safari eviction behavior
- [The pain and anguish of using IndexedDB](https://gist.github.com/pesterhazy/4de96193af89a6dd5ce682ce2adff49a) -- community-documented IndexedDB pitfalls (MEDIUM confidence)
- [TanStack Virtual documentation](https://tanstack.com/virtual/latest) -- virtualization capabilities and benchmarks (HIGH confidence, official)
- [JMIR: When and Why Adults Abandon Lifestyle Behavior Apps](https://www.jmir.org/2024/1/e56897) -- peer-reviewed retention research (HIGH confidence)
- [PMC: Challenges in Participant Engagement Using Mobile Health Apps](https://pmc.ncbi.nlm.nih.gov/articles/PMC9092233/) -- engagement/retention patterns (HIGH confidence)
- [Anthropic: Claude API Pricing](https://platform.claude.com/docs/en/about-claude/pricing) -- current pricing and prompt caching details (HIGH confidence, official)
- [Anthropic: Usage and Cost API](https://platform.claude.com/docs/en/build-with-claude/usage-cost-api) -- cost monitoring capabilities (HIGH confidence, official)
- [Ink & Switch: Local-first Software](https://www.inkandswitch.com/essay/local-first/) -- foundational local-first architecture paper (HIGH confidence)
- [LogRocket: Rendering Large Lists with React Virtualized](https://blog.logrocket.com/rendering-large-lists-react-virtualized/) -- virtualization patterns and thresholds (MEDIUM confidence)
- [Neon: Comparing Local-first Frameworks](https://neon.com/blog/comparing-local-first-frameworks-and-approaches) -- sync engine comparison (MEDIUM confidence)

---
*Pitfalls research for: Weeky (week-based life journaling/archive app)*
*Researched: 2026-03-02*
