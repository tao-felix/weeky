'use client';

import { useEffect, useMemo, useState } from 'react';
import { WeekGrid } from '@/components/grid/WeekGrid';
import { WeekCard } from '@/components/card/WeekCard';
import { CurrentWeekPanel } from '@/components/panel/CurrentWeekPanel';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ExportButton } from '@/components/ExportButton';
import { ImportDialog } from '@/components/import/ImportDialog';
import { SearchModal } from '@/components/search/SearchModal';
import { useUIStore } from '@/stores/ui-store';
import { useSetting } from '@/hooks/use-api';
import { getCurrentWeek, getWeekBoundaries } from '@/lib/week-utils';
import { AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { Upload, Search } from 'lucide-react';

function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start + 'T00:00:00');
  const endDate = new Date(end + 'T00:00:00');
  return `${format(startDate, 'MMM d')} – ${format(endDate, 'MMM d, yyyy')}`;
}

export default function Home() {
  const selectedWeekNumber = useUIStore((state) => state.selectedWeekNumber);
  const hoveredWeekNumber = useUIStore((state) => state.hoveredWeekNumber);
  const currentWeek = useMemo(() => getCurrentWeek(), []);

  const { value: birthDateValue, loaded: birthDateLoaded } = useSetting('birthDate');

  const [importOpen, setImportOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const panelWeek = selectedWeekNumber ?? currentWeek;
  const displayWeek = hoveredWeekNumber ?? currentWeek;
  const displayBoundaries = useMemo(
    () => getWeekBoundaries(displayWeek),
    [displayWeek]
  );
  const isHovering = hoveredWeekNumber !== null;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!birthDateLoaded) {
    return <div className="h-screen bg-[#FAF8F5] dark:bg-[#1A1A1A]" />;
  }

  if (!birthDateValue) {
    return <OnboardingModal onComplete={() => {}} />;
  }

  return (
    <div className="flex flex-col h-screen bg-[#FAF8F5] dark:bg-[#1A1A1A]">
      {/* Shared header */}
      <div className="flex-none px-4 pt-8 pb-3 sm:px-6 text-center relative">
        <div className="absolute top-6 right-4 sm:right-6 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-[#6B6B6B] hover:text-[#1A1A1A] dark:text-stone-500 dark:hover:text-stone-300 hover:bg-[#F0EDE8] dark:hover:bg-stone-800 transition-colors"
            title="Search (⌘K)"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-[#6B6B6B] hover:text-[#1A1A1A] dark:text-stone-500 dark:hover:text-stone-300 hover:bg-[#F0EDE8] dark:hover:bg-stone-800 transition-colors"
            title="Import from Obsidian"
          >
            <Upload className="h-4 w-4" />
          </button>
          <ExportButton />
          <ThemeToggle />
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl italic text-[#1A1A1A] dark:text-[#E8E6E3]">
          Your 4000 Weeks
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-[#6B6B6B] dark:text-stone-500 tracking-wide">
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
      <div className="flex-none flex justify-center gap-4 sm:gap-5 px-4 py-2 text-[10px] sm:text-xs text-[#6B6B6B] dark:text-stone-500 tracking-wide uppercase">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm bg-[#DCD0C0] dark:bg-stone-700" />
          Lived
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm bg-[#C08283] dark:bg-[#C08283]" />
          Captured
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm bg-[#8BBFBC] dark:bg-[#8BBFBC]" />
          Synthesized
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm bg-[#FEC66E] dark:bg-[#FEC66E]" />
          Current
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm bg-[#F0EDE8] dark:bg-[#242424] border border-[#E8E5E0] dark:border-stone-700" />
          Future
        </span>
      </div>

      {/* Main content: left panel + right grid (50/50) */}
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
      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
