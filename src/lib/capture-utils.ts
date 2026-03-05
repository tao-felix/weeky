import { db } from './db';
import type { Entry } from './types';

/**
 * Get or create a device ID for this browser instance.
 * Used for future sync capabilities.
 */
async function getDeviceId(): Promise<string> {
  const setting = await db.settings.get('deviceId');
  if (setting?.value && typeof setting.value === 'string') {
    return setting.value;
  }
  const newDeviceId = crypto.randomUUID();
  await db.settings.put({
    key: 'deviceId',
    value: newDeviceId,
    updatedAt: new Date().toISOString(),
  });
  return newDeviceId;
}

/**
 * Create a quick capture entry and persist it to IndexedDB.
 * Returns the created entry.
 */
export async function createQuickCapture({
  content,
  weekNumber,
}: {
  content: string;
  weekNumber: number;
}): Promise<Entry> {
  const now = new Date().toISOString();
  const deviceId = await getDeviceId();

  const entry: Entry = {
    id: crypto.randomUUID(),
    weekId: `week-${weekNumber}`,
    content,
    type: 'quick',
    createdAt: now,
    updatedAt: now,
    deviceId,
  };

  await db.entries.add(entry);
  return entry;
}
