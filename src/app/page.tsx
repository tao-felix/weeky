'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { getCurrentWeek, getWeekBoundaries } from '@/lib/week-utils';
import { useUIStore } from '@/stores/ui-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start + 'T00:00:00');
  const endDate = new Date(end + 'T00:00:00');
  return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
}

export default function Home() {
  const currentWeek = getCurrentWeek();
  const boundaries = getWeekBoundaries(currentWeek);

  const entryCount = useLiveQuery(() => db.entries.count());

  const selectedWeekNumber = useUIStore((state) => state.selectedWeekNumber);
  const setSelectedWeekNumber = useUIStore((state) => state.setSelectedWeekNumber);

  async function handleAddTestEntry() {
    const deviceIdSetting = await db.settings.get('deviceId');
    const deviceId = (deviceIdSetting?.value as string) ?? 'unknown';
    const now = new Date().toISOString();

    await db.entries.add({
      id: crypto.randomUUID(),
      weekId: `week-${currentWeek}`,
      content: `Test entry created at ${now}`,
      type: 'quick',
      createdAt: now,
      updatedAt: now,
      deviceId,
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <main className="flex w-full max-w-md flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight">Weeky</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            4000 weeks, one card at a time.
          </p>
        </div>

        {/* Current Week Card */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Week {currentWeek}</CardTitle>
            <CardDescription>{formatDateRange(boundaries.start, boundaries.end)}</CardDescription>
          </CardHeader>
        </Card>

        {/* Database Status Card */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Database Status</CardTitle>
            <CardDescription>IndexedDB via Dexie.js</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Entries: <span className="font-mono font-semibold text-foreground">{entryCount ?? 0}</span>
            </span>
            <Button onClick={handleAddTestEntry} size="sm">
              Add Test Entry
            </Button>
          </CardContent>
        </Card>

        {/* Persistence Card */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Persistence</CardTitle>
            <CardDescription>
              Refresh this page to verify data persists.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Zustand State Card */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>UI State</CardTitle>
            <CardDescription>Zustand store (client-only, non-persistent)</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Selected week:{' '}
              <span className="font-mono font-semibold text-foreground">
                {selectedWeekNumber ?? 'none'}
              </span>
            </span>
            <Button
              onClick={() =>
                setSelectedWeekNumber(selectedWeekNumber === currentWeek ? null : currentWeek)
              }
              size="sm"
              variant={selectedWeekNumber === currentWeek ? 'secondary' : 'outline'}
            >
              {selectedWeekNumber === currentWeek ? 'Deselect' : 'Select Current'}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
