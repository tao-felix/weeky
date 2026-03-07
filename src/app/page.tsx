'use client';

import { WeekGrid } from '@/components/grid/WeekGrid';
import { WeekCard } from '@/components/card/WeekCard';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { useUIStore } from '@/stores/ui-store';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { AnimatePresence } from 'motion/react';

export default function Home() {
  const selectedWeekNumber = useUIStore((state) => state.selectedWeekNumber);

  // Reactive query: re-fires when birthDate is saved to Dexie.
  // Return null for "not found" to distinguish from undefined (still loading).
  const birthDateSetting = useLiveQuery(
    () => db.settings.get('birthDate').then((s) => s ?? null)
  );

  // Still loading from IndexedDB -- show nothing to avoid flash
  if (birthDateSetting === undefined) {
    return <div className="h-screen bg-stone-50 dark:bg-stone-950" />;
  }

  // First-time user: no birth date saved yet
  if (birthDateSetting === null) {
    return (
      <OnboardingModal
        onComplete={() => {
          // No-op: useLiveQuery reactivity handles the switch automatically
        }}
      />
    );
  }

  // Returning user: show the grid
  return (
    <div className="flex flex-col h-screen bg-stone-50 dark:bg-stone-950">
      <WeekGrid />
      <AnimatePresence>
        {selectedWeekNumber !== null && (
          <WeekCard weekNumber={selectedWeekNumber} />
        )}
      </AnimatePresence>
    </div>
  );
}
