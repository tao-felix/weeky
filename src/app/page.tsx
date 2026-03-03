'use client';

import { WeekGrid } from '@/components/grid/WeekGrid';
import { WeekCard } from '@/components/card/WeekCard';
import { useUIStore } from '@/stores/ui-store';
import { AnimatePresence } from 'motion/react';

export default function Home() {
  const selectedWeekNumber = useUIStore((state) => state.selectedWeekNumber);

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
