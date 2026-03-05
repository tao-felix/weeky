# Phase 4: AI Synthesis - Research

**Researched:** 2026-03-05
**Domain:** AI integration (Claude API via Vercel AI SDK), Next.js streaming, structured output
**Confidence:** HIGH

## Summary

Phase 4 transforms raw week captures into polished cards by integrating Claude AI through a server-side proxy. The standard approach for this Next.js + Vercel stack is the **Vercel AI SDK** (`ai` package) with the **`@ai-sdk/anthropic`** provider. This gives us streaming, structured output, token tracking, and cost controls out of the box -- no custom SSE plumbing needed.

The architecture is straightforward: a Next.js App Router Route Handler at `/api/synthesize` receives a weekId, loads entries from the request body (client sends them), calls `streamText()` with Claude Haiku 4.5 (`claude-haiku-4-5`), and streams back a structured response containing `headline` and `highlights`. The client consumes the stream with either `useCompletion` or a custom fetch + ReadableStream reader, updating the UI in real-time as tokens arrive, then persists the final result to the `syntheses` IndexedDB store via Dexie.

**Primary recommendation:** Use `ai` + `@ai-sdk/anthropic` with `streamText()` and `Output.object()` for structured streaming. Claude Haiku 4.5 at $1/$5 per MTok is the right model for cost-controlled synthesis of short personal notes.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AI-01 | User can trigger AI synthesis for any week with captures | Route Handler + client trigger button; streamText for generation |
| AI-02 | AI generates a card-native headline (short, evocative title) | Structured output schema with Zod: `headline` field with system prompt guidance |
| AI-03 | AI generates curated highlights (key themes/moments) | Structured output schema: `highlights` string array field |
| AI-04 | AI synthesis streams back in real-time (visible progress) | `streamText()` + `toTextStreamResponse()` with client-side ReadableStream consumption |
| AI-05 | AI API key never exposed to client (server-side proxy) | Route Handler uses `process.env.ANTHROPIC_API_KEY` (no NEXT_PUBLIC_ prefix) |
| AI-06 | AI costs controlled (Haiku model, prompt caching, token limits) | `claude-haiku-4-5` ($1/$5 MTok), `maxOutputTokens`, prompt caching via provider options |
| CARD-01 | Card front displays week number and AI-generated headline | CardFront already queries `db.syntheses` and renders `synthesis.headline` -- just needs data |
| CARD-03 | Card back displays AI-synthesized highlights | New SynthesisView component rendering `synthesis.highlights` array |
| CARD-04 | User can toggle between Raw and AI views on card back | Tab toggle in CardBack: "Captures" vs "Synthesis" with local state |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `ai` | ^4.x (latest) | Vercel AI SDK core -- `streamText`, `Output.object` | Official Vercel toolkit for AI in Next.js; unified streaming, structured output, token tracking |
| `@ai-sdk/anthropic` | ^1.x (latest) | Anthropic provider for AI SDK | First-party provider; handles auth, streaming protocol, model selection |
| `zod` | ^4.3.6 | Schema definition for structured output | Already in project; AI SDK uses Zod for `Output.object()` schema |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@ai-sdk/react` | ^1.x (latest) | React hooks (`useCompletion`) | Optional -- only if we want the managed hook pattern instead of manual fetch |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vercel AI SDK | Raw `fetch` to Anthropic API | Works but requires manual SSE parsing, no structured output, no token tracking |
| `useCompletion` hook | Manual `fetch` + `ReadableStream` reader | More control over UI state; better fit since this is a one-shot action, not a chat |
| `streamText` | `generateText` (non-streaming) | Simpler but violates AI-04 (real-time streaming requirement) |

**Installation:**
```bash
npm install ai @ai-sdk/anthropic
```

Note: `zod` is already installed. `@ai-sdk/react` is optional -- manual fetch with ReadableStream may be simpler for this use case since it is a single-action trigger, not a conversational chat.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── api/
│       └── synthesize/
│           └── route.ts          # POST handler -- server-side Claude proxy
├── components/
│   └── card/
│       ├── CardBack.tsx          # MODIFY: add Raw/Synthesis toggle
│       ├── CardFront.tsx         # ALREADY DONE: renders synthesis.headline
│       ├── SynthesisView.tsx     # NEW: renders AI highlights
│       └── SynthesizeButton.tsx  # NEW: trigger button with streaming state
├── lib/
│   ├── synthesis-utils.ts        # NEW: persist synthesis to Dexie, prompt builder
│   └── types.ts                  # MODIFY: verify Synthesis type matches needs
```

### Pattern 1: Server-Side Streaming Proxy
**What:** Route Handler receives entries, calls Claude, streams back text
**When to use:** Always -- this is the only safe pattern for API key protection (AI-05)
**Example:**
```typescript
// src/app/api/synthesize/route.ts
import { streamText, Output } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

const synthesisSchema = z.object({
  headline: z.string().describe('Short evocative title like "Naval & Rebranding"'),
  highlights: z.array(z.string()).describe('3-5 key themes or moments from the week'),
});

export async function POST(req: Request) {
  const { weekNumber, entries } = await req.json();

  // Build prompt from entries
  const entriesText = entries
    .map((e: { type: string; content: string; createdAt: string }) =>
      `[${e.type}] ${e.createdAt}: ${e.content}`
    )
    .join('\n');

  const result = streamText({
    model: anthropic('claude-haiku-4-5'),
    maxOutputTokens: 500,
    temperature: 0.7,
    system: `You are a personal life archivist creating a week card for someone's life archive.
Given the week's captures (quick thoughts and reflections), generate:
1. A headline: A short, evocative title (2-5 words, no "Week N:" prefix) that captures the essence of the week. Think magazine section headers.
2. Highlights: 3-5 bullet points summarizing key themes, moments, or insights from the week. Each should be a complete sentence.

Output ONLY valid JSON matching this schema: { "headline": string, "highlights": string[] }`,
    prompt: `Week ${weekNumber} captures:\n\n${entriesText}`,
  });

  return result.toTextStreamResponse();
}
```

### Pattern 2: Client-Side Stream Consumption with Manual Fetch
**What:** Client fetches the streaming endpoint, reads chunks, updates UI progressively
**When to use:** For one-shot synthesis trigger (not conversational chat)
**Example:**
```typescript
// Client-side synthesis trigger
async function triggerSynthesis(weekNumber: number, entries: Entry[]) {
  const response = await fetch('/api/synthesize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weekNumber, entries }),
  });

  if (!response.ok) throw new Error('Synthesis failed');
  if (!response.body) throw new Error('No stream body');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    fullText += decoder.decode(value, { stream: true });
    // Update UI with partial text as it streams
    onProgress(fullText);
  }

  // Parse complete JSON and persist
  const synthesis = JSON.parse(fullText);
  return synthesis;
}
```

### Pattern 3: Synthesis Persistence to Dexie
**What:** After streaming completes, save the structured result to IndexedDB
**When to use:** After every successful synthesis
**Example:**
```typescript
// src/lib/synthesis-utils.ts
import { db } from './db';
import type { Synthesis } from './types';

export async function saveSynthesis({
  weekNumber,
  headline,
  highlights,
  deviceId,
}: {
  weekNumber: number;
  headline: string;
  highlights: string[];
  deviceId: string;
}): Promise<Synthesis> {
  const now = new Date().toISOString();
  const synthesis: Synthesis = {
    id: crypto.randomUUID(),
    weekId: `week-${weekNumber}`,
    headline,
    highlights,
    model: 'claude-haiku-4-5',
    createdAt: now,
    updatedAt: now,
    deviceId,
  };

  // Upsert: delete old synthesis for this week, add new one
  await db.transaction('rw', db.syntheses, async () => {
    await db.syntheses.where('weekId').equals(`week-${weekNumber}`).delete();
    await db.syntheses.add(synthesis);
  });

  return synthesis;
}
```

### Pattern 4: CardBack Raw/Synthesis Toggle
**What:** Tab toggle on card back between Raw captures and AI-synthesized view
**When to use:** When a synthesis exists for the week
**Example:**
```typescript
// CardBack view mode toggle
type BackViewMode = 'captures' | 'synthesis';

// In CardBack component:
const [viewMode, setViewMode] = useState<BackViewMode>('captures');
const synthesis = useLiveQuery(
  () => db.syntheses.where('weekId').equals(`week-${weekNumber}`).first(),
  [weekNumber]
);

// Show toggle only when synthesis exists
{synthesis && (
  <div className="flex gap-1 ...">
    <button onClick={() => setViewMode('captures')}>Captures</button>
    <button onClick={() => setViewMode('synthesis')}>Synthesis</button>
  </div>
)}

// Render based on mode
{viewMode === 'captures' ? <CapturesList /> : <SynthesisView synthesis={synthesis} />}
```

### Anti-Patterns to Avoid
- **Exposing API key client-side:** Never use `NEXT_PUBLIC_ANTHROPIC_API_KEY`. All Claude calls MUST go through the Route Handler.
- **Non-streaming generation:** Don't use `generateText` when streaming is required (AI-04). Users need to see real-time progress.
- **Storing raw AI response as single string:** Use structured `headline` + `highlights[]` fields, not free-form text. The data model already supports this.
- **Re-synthesizing on every card open:** Cache synthesis in Dexie. Only re-trigger manually (explicit user action).
- **Sending all entries as chat messages:** This is a single-prompt summarization, not a conversation. Use `prompt` not `messages`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SSE/streaming protocol | Custom EventSource/SSE parser | `streamText()` + `toTextStreamResponse()` | Edge cases with chunking, backpressure, error recovery |
| Claude API client | Raw fetch to `api.anthropic.com` | `@ai-sdk/anthropic` provider | Auth headers, retry logic, streaming protocol, model routing |
| Structured JSON from LLM | String parsing with regex | `Output.object()` with Zod schema or system prompt JSON instruction | LLMs produce malformed JSON; schema validation catches this |
| Token counting | Manual tokenizer | AI SDK `result.usage` / `onFinish` callback | Accurate provider-reported counts, not approximations |
| Rate limiting | Custom middleware | Simple per-request token cap via `maxOutputTokens` | Sufficient for personal app; advanced rate limiting is premature |

**Key insight:** The Vercel AI SDK eliminates the entire "streaming AI proxy" problem space. The combination of `streamText()` + `@ai-sdk/anthropic` + Route Handler handles auth, streaming, error recovery, and token tracking. Building any of this from scratch would be 10x the code with 10x the bugs.

## Common Pitfalls

### Pitfall 1: Streaming JSON is Not Parseable Mid-Stream
**What goes wrong:** Client tries to `JSON.parse()` partial stream chunks, getting syntax errors until the full response arrives.
**Why it happens:** When streaming structured JSON, intermediate chunks are incomplete JSON fragments.
**How to avoid:** Two options: (a) Stream plain text and parse only the complete response, or (b) Use `Output.object()` with `partialOutputStream` which handles partial object assembly. For this use case, option (a) is simpler -- stream raw text, accumulate, parse at end.
**Warning signs:** `SyntaxError: Unexpected end of JSON input` in console during streaming.

### Pitfall 2: API Key in Client Bundle
**What goes wrong:** `ANTHROPIC_API_KEY` accidentally prefixed with `NEXT_PUBLIC_` or imported in a client component.
**Why it happens:** Developer tries to call Claude directly from the browser for simplicity.
**How to avoid:** Keep the API key in `.env.local` without `NEXT_PUBLIC_` prefix. Only access it in `src/app/api/*/route.ts` files. Add `.env.local` to `.gitignore` (Next.js does this by default).
**Warning signs:** API key visible in browser DevTools Network tab or bundle.

### Pitfall 3: Haiku Model ID Mismatch
**What goes wrong:** Using outdated model IDs like `claude-3-haiku-20240307` when the current model is `claude-haiku-4-5`.
**Why it happens:** Stale documentation, training data, or copy-paste from old examples.
**How to avoid:** Use `claude-haiku-4-5` as the model ID. The AI SDK Anthropic provider accepts this directly: `anthropic('claude-haiku-4-5')`.
**Warning signs:** API returns "model not found" or uses a deprecated model with worse quality.

### Pitfall 4: Missing Error Handling on Synthesis Failure
**What goes wrong:** Network error or API rate limit kills the stream silently; UI shows partial/broken content.
**Why it happens:** No error boundary around the streaming flow.
**How to avoid:** Wrap fetch in try/catch, check `response.ok` before reading stream, handle `reader.read()` errors, show error state in UI. Use `onError` callback in `streamText` server-side for logging.
**Warning signs:** UI stuck in "loading" state or showing garbled text after network hiccup.

### Pitfall 5: Synthesis Overwrites Without Confirmation
**What goes wrong:** User triggers synthesis again, old result is silently replaced with new one.
**Why it happens:** Upsert logic without user confirmation.
**How to avoid:** For MVP, upsert is fine (replace old synthesis). Add a confirmation dialog if desired later. The `updatedAt` field tracks when synthesis was last generated.
**Warning signs:** User confusion when synthesis changes unexpectedly.

### Pitfall 6: Sending Too Much Data to the API
**What goes wrong:** Weeks with many captures hit token limits or generate expensive API calls.
**Why it happens:** No truncation or token budget for input.
**How to avoid:** Set `maxOutputTokens: 500` (plenty for headline + 5 highlights). For input, a week of personal notes is typically <2000 tokens. If needed, truncate entries to last N or limit total character count before sending.
**Warning signs:** API returns incomplete responses or bills spike unexpectedly.

## Code Examples

### Complete Route Handler with Cost Controls
```typescript
// src/app/api/synthesize/route.ts
// Source: Vercel AI SDK docs + @ai-sdk/anthropic provider docs
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export async function POST(req: Request) {
  const { weekNumber, entries } = await req.json();

  // Validate input
  if (!weekNumber || !entries?.length) {
    return new Response('Missing weekNumber or entries', { status: 400 });
  }

  // Cap input to prevent abuse (AI-06)
  const maxEntries = 50;
  const truncatedEntries = entries.slice(0, maxEntries);

  const entriesText = truncatedEntries
    .map((e: { type: string; content: string; createdAt: string }) =>
      `[${e.type}] ${e.createdAt}: ${e.content}`
    )
    .join('\n');

  const result = streamText({
    model: anthropic('claude-haiku-4-5'),
    maxOutputTokens: 500, // Cost control (AI-06)
    temperature: 0.7,
    system: `You are a personal life archivist. Given a person's week captures, create a card for their life archive.

Output a JSON object with exactly two fields:
- "headline": A short, evocative title (2-5 words) capturing the week's essence. Think magazine headers. Do NOT include "Week N:" prefix.
- "highlights": An array of 3-5 strings, each a concise sentence about a key theme, moment, or insight from the week.

Examples:
{"headline": "Naval & Rebranding", "highlights": ["Deep dive into Naval's philosophy on leverage and specific knowledge.", "Kicked off the company rebrand with new visual direction.", "Reflected on the tension between ambition and presence."]}
{"headline": "The Facebook Path", "highlights": ["Explored Facebook's early growth playbook and network effects.", "Context engineering emerged as a key interest area.", "Wrestled with whether to build for distribution or depth."]}

Output ONLY the JSON object, no markdown, no explanation.`,
    prompt: `Week ${weekNumber} captures:\n\n${entriesText}`,
    onError: ({ error }) => {
      console.error('[synthesis] Stream error:', error);
    },
  });

  return result.toTextStreamResponse();
}
```

### Client-Side Synthesis Trigger Hook
```typescript
// src/lib/synthesis-utils.ts
import { db } from './db';
import type { Synthesis, Entry } from './types';

export async function runSynthesis({
  weekNumber,
  entries,
  onProgress,
}: {
  weekNumber: number;
  entries: Entry[];
  onProgress?: (text: string) => void;
}): Promise<{ headline: string; highlights: string[] }> {
  const response = await fetch('/api/synthesize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      weekNumber,
      entries: entries.map((e) => ({
        type: e.type,
        content: e.content,
        createdAt: e.createdAt,
      })),
    }),
  });

  if (!response.ok) {
    throw new Error(`Synthesis failed: ${response.status}`);
  }

  if (!response.body) {
    throw new Error('No response stream');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    fullText += decoder.decode(value, { stream: true });
    onProgress?.(fullText);
  }

  // Parse complete JSON
  const parsed = JSON.parse(fullText);
  return { headline: parsed.headline, highlights: parsed.highlights };
}

export async function saveSynthesis({
  weekNumber,
  headline,
  highlights,
}: {
  weekNumber: number;
  headline: string;
  highlights: string[];
}): Promise<Synthesis> {
  const deviceId = await getDeviceId();
  const now = new Date().toISOString();

  const synthesis: Synthesis = {
    id: crypto.randomUUID(),
    weekId: `week-${weekNumber}`,
    headline,
    highlights,
    model: 'claude-haiku-4-5',
    createdAt: now,
    updatedAt: now,
    deviceId,
  };

  await db.transaction('rw', db.syntheses, async () => {
    await db.syntheses.where('weekId').equals(`week-${weekNumber}`).delete();
    await db.syntheses.add(synthesis);
  });

  return synthesis;
}

async function getDeviceId(): Promise<string> {
  const setting = await db.settings.get('deviceId');
  if (setting?.value && typeof setting.value === 'string') return setting.value;
  const id = crypto.randomUUID();
  await db.settings.put({ key: 'deviceId', value: id, updatedAt: new Date().toISOString() });
  return id;
}
```

### SynthesizeButton Component
```typescript
// src/components/card/SynthesizeButton.tsx
'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import type { Entry } from '@/lib/types';
import { runSynthesis, saveSynthesis } from '@/lib/synthesis-utils';

interface SynthesizeButtonProps {
  weekNumber: number;
  entries: Entry[];
  onComplete?: () => void;
}

export function SynthesizeButton({ weekNumber, entries, onComplete }: SynthesizeButtonProps) {
  const [status, setStatus] = useState<'idle' | 'streaming' | 'error'>('idle');
  const [streamText, setStreamText] = useState('');

  const handleSynthesize = async () => {
    setStatus('streaming');
    setStreamText('');

    try {
      const result = await runSynthesis({
        weekNumber,
        entries,
        onProgress: (text) => setStreamText(text),
      });

      await saveSynthesis({ weekNumber, ...result });
      setStatus('idle');
      onComplete?.();
    } catch (err) {
      console.error('Synthesis error:', err);
      setStatus('error');
    }
  };

  return (
    <button
      onClick={handleSynthesize}
      disabled={status === 'streaming' || entries.length === 0}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded
        bg-amber-100 text-amber-700 hover:bg-amber-200
        disabled:opacity-50 disabled:cursor-not-allowed
        dark:bg-amber-900 dark:text-amber-300 dark:hover:bg-amber-800"
    >
      {status === 'streaming' ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Sparkles className="w-3 h-3" />
      )}
      {status === 'streaming' ? 'Synthesizing...' : 'Synthesize'}
    </button>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `claude-3-haiku-20240307` | `claude-haiku-4-5` | Late 2025 | Better quality, same cost tier ($1/$5 MTok), extended thinking support |
| `toDataStreamResponse()` | `toUIMessageStreamResponse()` | AI SDK v4+ | New default for UI hooks; `toTextStreamResponse()` still best for simple streaming |
| Manual SSE parsing | AI SDK `streamText()` | AI SDK v3+ | Eliminates all streaming boilerplate |
| `useChat` for everything | `useCompletion` or manual fetch | Always | `useChat` is for conversations; `useCompletion`/manual fetch for one-shot generation |

**Deprecated/outdated:**
- `claude-3-haiku-20240307`: Replaced by `claude-haiku-4-5`. Still works but older generation.
- `toDataStreamResponse()`: Renamed/replaced by `toUIMessageStreamResponse()` in newer AI SDK versions.
- Pages Router API routes (`pages/api/*`): App Router Route Handlers (`app/api/*/route.ts`) are the current standard.

## Open Questions

1. **Streaming partial JSON vs plain text**
   - What we know: `streamText` with `toTextStreamResponse()` streams raw text. `Output.object()` with `partialOutputStream` can stream partial objects.
   - What's unclear: Whether showing partial JSON to the user during streaming looks good, or if we should show a "thinking..." animation and reveal the complete result.
   - Recommendation: Stream the raw text but show a loading/typing animation. Parse and display the structured result only after the stream completes. This avoids the UX awkwardness of partial JSON.

2. **Re-synthesis behavior**
   - What we know: The Synthesis type supports one synthesis per week (upserted).
   - What's unclear: Should re-synthesis require confirmation? Should we keep history of past syntheses?
   - Recommendation: For MVP, silently replace. The button label changes to "Re-synthesize" if synthesis exists. No confirmation dialog needed for personal app.

3. **Vercel deployment environment variable**
   - What we know: `.env.local` works locally. Vercel needs the env var configured.
   - What's unclear: The user prefers GitHub-based config for Vercel env vars.
   - Recommendation: For local dev, use `.env.local`. For Vercel deployment, add `ANTHROPIC_API_KEY` via the approach the user prefers (GitHub config file or Vercel dashboard).

## Sources

### Primary (HIGH confidence)
- [Vercel AI SDK - Anthropic Provider](https://ai-sdk.dev/providers/ai-sdk-providers/anthropic) - Installation, model IDs, streaming config, prompt caching
- [Vercel AI SDK - streamText Reference](https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text) - All parameters, callbacks, response methods
- [Vercel AI SDK - Getting Started Next.js](https://ai-sdk.dev/docs/getting-started/nextjs-app-router) - Route handler + client patterns
- [Vercel AI SDK - Structured Data](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data) - Output.object(), Zod schema, partialOutputStream
- [Next.js 16 Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers) - Route handler conventions, streaming support
- [Anthropic Claude Models](https://platform.claude.com/docs/en/about-claude/models/overview) - Model IDs and capabilities
- [Anthropic Pricing](https://platform.claude.com/docs/en/about-claude/pricing) - Haiku 4.5: $1/$5 per MTok

### Secondary (MEDIUM confidence)
- [Vercel AI SDK - Stream Protocols](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol) - Data vs text stream differences
- [Vercel AI SDK - useCompletion](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-completion) - Hook for non-chat text generation
- [Next.js Env Variables](https://nextjs.org/docs/pages/guides/environment-variables) - Server-only env var security

### Tertiary (LOW confidence)
- None -- all findings verified with primary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Vercel AI SDK is the official, well-documented toolkit for this exact use case
- Architecture: HIGH - Route Handler + streamText pattern is documented with examples in official docs
- Pitfalls: HIGH - Well-known issues (key exposure, partial JSON parsing) documented across multiple sources
- Cost controls: HIGH - Haiku 4.5 pricing confirmed on official Anthropic pricing page

**Research date:** 2026-03-05
**Valid until:** 2026-04-05 (30 days -- stable ecosystem, model IDs may update)
