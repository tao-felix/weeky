import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const db = getDb();
  const weekNumber = req.nextUrl.searchParams.get('weekNumber');

  if (weekNumber) {
    const synthesis = db.prepare(
      'SELECT * FROM syntheses WHERE week_number = ? LIMIT 1'
    ).get(Number(weekNumber));
    return NextResponse.json(synthesis ?? null);
  }

  const all = db.prepare('SELECT * FROM syntheses ORDER BY created_at DESC').all();
  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  const { weekNumber, headline, highlights, model } = body;
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const weekId = `week-${weekNumber}`;

  // Upsert: delete existing, then insert
  db.prepare('DELETE FROM syntheses WHERE week_number = ?').run(weekNumber);
  db.prepare(`
    INSERT INTO syntheses (id, week_id, week_number, headline, highlights, model, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, weekId, weekNumber, headline, JSON.stringify(highlights), model ?? 'claude-haiku-4-5', now, now);

  return NextResponse.json({ ok: true, id });
}
