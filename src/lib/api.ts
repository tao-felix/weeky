// Client-side API layer — replaces direct Dexie calls

export interface SearchResult {
  result_type: 'entry' | 'synthesis' | 'week';
  id: string;
  week_number: number;
  content: string;
  type: string;
  created_at: string;
}

export async function fetchSearchResults(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];
  const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
  return res.json();
}

export async function fetchWeeks(): Promise<WeekRow[]> {
  const res = await fetch('/api/weeks');
  return res.json();
}

export async function fetchWeek(weekNumber: number): Promise<WeekRow | null> {
  const res = await fetch(`/api/weeks?weekNumber=${weekNumber}`);
  return res.json();
}

export async function fetchEntries(weekNumber: number): Promise<EntryRow[]> {
  const res = await fetch(`/api/entries?weekNumber=${weekNumber}`);
  return res.json();
}

export async function fetchEntryCounts(): Promise<{ week_number: number; count: number }[]> {
  const res = await fetch('/api/entries');
  return res.json();
}

export async function createEntry(data: {
  weekNumber: number;
  content: string;
  type: string;
  source?: string;
}): Promise<{ ok: boolean; id: string }> {
  const weekId = `week-${data.weekNumber}`;
  const res = await fetch('/api/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, weekId, id: crypto.randomUUID() }),
  });
  return res.json();
}

export async function fetchSetting(key: string): Promise<{ key: string; value: unknown } | null> {
  const res = await fetch(`/api/settings?key=${key}`);
  return res.json();
}

export async function saveSetting(key: string, value: unknown): Promise<void> {
  await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  });
}

export async function fetchSynthesis(weekNumber: number): Promise<SynthesisRow | null> {
  const res = await fetch(`/api/syntheses?weekNumber=${weekNumber}`);
  return res.json();
}

export async function saveSynthesis(data: {
  weekNumber: number;
  headline: string;
  highlights: string[];
  model?: string;
}): Promise<{ ok: boolean; id: string }> {
  const res = await fetch('/api/syntheses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function importObsidianFile(content: string, fileName: string): Promise<ImportResult> {
  const res = await fetch('/api/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, fileName }),
  });
  return res.json();
}

// Row types matching SQLite schema
export interface WeekRow {
  id: string;
  week_number: number;
  start_date: string;
  end_date: string;
  location: string | null;
  theme: string | null;
  metadata: string;
  created_at: string;
  updated_at: string;
}

export interface EntryRow {
  id: string;
  week_id: string;
  week_number: number;
  content: string;
  type: string;
  source: string;
  entry_date: string | null;
  day_of_week: number | null;
  is_done: number | null;
  metadata: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SynthesisRow {
  id: string;
  week_id: string;
  week_number: number;
  headline: string;
  highlights: string;
  model: string;
  input_hash: string | null;
  metadata: string;
  created_at: string;
  updated_at: string;
}

export interface ImportResult {
  weeksImported: number;
  entriesCreated: number;
  weeksSkipped: number;
  totalBlocks: number;
  error?: string;
}
