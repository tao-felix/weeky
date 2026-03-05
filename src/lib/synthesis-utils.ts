import { db } from './db';
import type { Synthesis, Entry } from './types';

/**
 * Trigger AI synthesis for a week's captures.
 * Streams the response and returns parsed headline + highlights.
 */
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

/**
 * Persist a synthesis result to IndexedDB.
 * Upserts: deletes existing synthesis for the week, then adds new one.
 */
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

/**
 * Get or create a device ID for this browser instance.
 * Duplicated from capture-utils (intentionally -- not exported there).
 */
async function getDeviceId(): Promise<string> {
  const setting = await db.settings.get('deviceId');
  if (setting?.value && typeof setting.value === 'string') {
    return setting.value;
  }
  const id = crypto.randomUUID();
  await db.settings.put({
    key: 'deviceId',
    value: id,
    updatedAt: new Date().toISOString(),
  });
  return id;
}
