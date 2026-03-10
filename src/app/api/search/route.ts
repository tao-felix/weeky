import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const db = getDb();
  const pattern = `%${q}%`;
  const limit = 20;

  const entries = db.prepare(`
    SELECT 'entry' as result_type, id, week_number, content, type, created_at
    FROM entries
    WHERE content LIKE ? COLLATE NOCASE
    ORDER BY created_at DESC
    LIMIT ?
  `).all(pattern, limit) as Array<{
    result_type: string; id: string; week_number: number;
    content: string; type: string; created_at: string;
  }>;

  const syntheses = db.prepare(`
    SELECT 'synthesis' as result_type, id, week_number, headline as content, 'synthesis' as type, created_at
    FROM syntheses
    WHERE headline LIKE ? COLLATE NOCASE
    ORDER BY created_at DESC
    LIMIT 5
  `).all(pattern) as Array<{
    result_type: string; id: string; week_number: number;
    content: string; type: string; created_at: string;
  }>;

  const weeks = db.prepare(`
    SELECT 'week' as result_type, id, week_number, COALESCE(location, '') || ' ' || COALESCE(theme, '') as content, 'week' as type, created_at
    FROM weeks
    WHERE location LIKE ? COLLATE NOCASE OR theme LIKE ? COLLATE NOCASE
    ORDER BY week_number DESC
    LIMIT 5
  `).all(pattern, pattern) as Array<{
    result_type: string; id: string; week_number: number;
    content: string; type: string; created_at: string;
  }>;

  const results = [...syntheses, ...weeks, ...entries].slice(0, limit);
  return NextResponse.json(results);
}
