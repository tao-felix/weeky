'use client';

import { useMemo } from 'react';
import { WeekGrid } from '@/components/grid/WeekGrid';
import { WeekCard } from '@/components/card/WeekCard';
import { CurrentWeekPanel } from '@/components/panel/CurrentWeekPanel';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ExportButton } from '@/components/ExportButton';
import { useUIStore } from '@/stores/ui-store';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { getCurrentWeek, getWeekBoundaries } from '@/lib/week-utils';
import { AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start + 'T00:00:00');
  const endDate = new Date(end + 'T00:00:00');
  return `${format(startDate, 'MMM d')} – ${format(endDate, 'MMM d, yyyy')}`;
}

export default function Home() {
  const selectedWeekNumber = useUIStore((state) => state.selectedWeekNumber);
  const hoveredWeekNumber = useUIStore((state) => state.hoveredWeekNumber);
  const currentWeek = useMemo(() => getCurrentWeek(), []);

  const birthDateSetting = useLiveQuery(
    () => db.settings.get('birthDate').then((s) => s ?? null)
  );

  const panelWeek = selectedWeekNumber ?? currentWeek;
  const displayWeek = hoveredWeekNumber ?? currentWeek;
  const displayBoundaries = useMemo(
    () => getWeekBoundaries(displayWeek),
    [displayWeek]
  );
  const isHovering = hoveredWeekNumber !== null;

  if (birthDateSetting === undefined) {
    return <div className="h-screen bg-stone-50 dark:bg-stone-950" />;
  }

  if (birthDateSetting === null) {
    return <OnboardingModal onComplete={() => {}} />;
  }

  return (
    <div className="flex flex-col h-screen bg-stone-50 dark:bg-stone-950">
      {/* Shared header */}
      <div className="flex-none px-4 pt-6 pb-2 sm:px-6 text-center relative">
        <div className="absolute top-4 right-4 sm:right-6 flex items-center gap-1">
          <ExportButton />
          <ThemeToggle />
        </div>
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-stone-700 dark:text-stone-300">
          Your 4000 Weeks
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-stone-400 dark:text-stone-500 font-mono">
          {isHovering ? (
            <>
              Week {displayWeek} &middot;{' '}
              {formatDateRange(displayBoundaries.start, displayBoundaries.end)}
            </>
          ) : (
            <>
              Now: Week {currentWeek} &middot;{' '}
              {formatDateRange(displayBoundaries.start, displayBoundaries.end)}
            </>
          )}
        </p>
      </div>

      {/* Legend */}
      <div className="flex-none flex justify-center gap-3 sm:gap-4 px-4 py-2 text-[10px] sm:text-xs text-stone-400 dark:text-stone-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-[1px] bg-stone-300 dark:bg-stone-700" />
          Empty
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-[1px] bg-amber-400 dark:bg-amber-600" />
          Captured
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-[1px] bg-emerald-500 dark:bg-emerald-600" />
          Synthesized
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-[1px] bg-orange-500" />
          Current
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-[1px] bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800" />
          Future
        </span>
      </div>

      {/* Main content: left panel + right grid (equal width) */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Week detail panel (desktop only) */}
        <div className="hidden md:flex flex-1 min-w-0">
          <CurrentWeekPanel weekNumber={panelWeek} />
        </div>

        {/* Right: Grid */}
        <div className="flex-1 flex flex-col min-w-0">
          <WeekGrid />
        </div>
      </div>

      {/* Card overlay (mobile only — desktop uses left panel) */}
      <div className="md:hidden">
        <AnimatePresence>
          {selectedWeekNumber !== null && (
            <WeekCard weekNumber={selectedWeekNumber} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
