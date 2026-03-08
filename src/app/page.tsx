'use client';

import { WeekGrid } from '@/components/grid/WeekGrid';
import { WeekCard } from '@/components/card/WeekCard';
import { CurrentWeekPanel } from '@/components/panel/CurrentWeekPanel';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { useUIStore } from '@/stores/ui-store';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { AnimatePresence } from 'motion/react';

export default function Home() {
  const selectedWeekNumber = useUIStore((state) => state.selectedWeekNumber);

  const birthDateSetting = useLiveQuery(
    () => db.settings.get('birthDate').then((s) => s ?? null)
  );

  if (birthDateSetting === undefined) {
    return <div className="h-screen bg-stone-50 dark:bg-stone-950" />;
  }

  if (birthDateSetting === null) {
    return <OnboardingModal onComplete={() => {}} />;
  }

  return (
    <div className="flex h-screen bg-stone-50 dark:bg-stone-950">
      {/* Left: Current week panel */}
      <div className="hidden md:flex w-80 lg:w-96 flex-none">
        <CurrentWeekPanel />
      </div>

      {/* Right: Grid */}
      <div className="flex-1 flex flex-col min-w-0">
        <WeekGrid />
      </div>

      {/* Card overlay (click any week) */}
      <AnimatePresence>
        {selectedWeekNumber !== null && (
          <WeekCard weekNumber={selectedWeekNumber} />
        )}
      </AnimatePresence>
    </div>
  );
}
