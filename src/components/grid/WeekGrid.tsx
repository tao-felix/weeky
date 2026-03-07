'use client';

import { useRef, useCallback, useEffect, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { getCurrentWeek, getWeekBoundaries } from '@/lib/week-utils';
import {
  TOTAL_ROWS,
  WEEKS_PER_ROW,
  TOTAL_WEEKS,
  rowColToWeekNumber,
  getWeekState,
  getRowForWeek,
  getYearForRow,
} from '@/lib/grid-utils';
import { useUIStore } from '@/stores/ui-store';
import { WeekCell } from './WeekCell';
import { ThemeToggle } from '../ThemeToggle';
import { ExportButton } from '../ExportButton';
import { format } from 'date-fns';

// Derive the year of Week 1 for year labels
const week1Boundaries = getWeekBoundaries(1);
const WEEK1_YEAR = parseInt(week1Boundaries.start.substring(0, 4));

function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start + 'T00:00:00');
  const endDate = new Date(end + 'T00:00:00');
  return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
}

export function WeekGrid() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentWeek = useMemo(() => getCurrentWeek(), []);
  const currentRow = useMemo(() => getRowForWeek(currentWeek), [currentWeek]);

  // Zustand state
  const selectedWeekNumber = useUIStore((s) => s.selectedWeekNumber);
  const setSelectedWeekNumber = useUIStore((s) => s.setSelectedWeekNumber);
  const hoveredWeekNumber = useUIStore((s) => s.hoveredWeekNumber);
  const setHoveredWeekNumber = useUIStore((s) => s.setHoveredWeekNumber);

  // Reactive data: which weeks have entries and syntheses
  const entryWeekIds = useLiveQuery(async () => {
    const keys = await db.entries.orderBy('weekId').uniqueKeys();
    return new Set(keys as string[]);
  });

  const synthesisWeekIds = useLiveQuery(async () => {
    const syntheses = await db.syntheses.toArray();
    return new Set(syntheses.map((s) => s.weekId));
  });

  // Row virtualizer
  const rowVirtualizer = useVirtualizer({
    count: TOTAL_ROWS,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 14, // row height: cell size + gap
    overscan: 5,
  });

  // Auto-scroll to current week on mount
  useEffect(() => {
    // Small delay to ensure virtualizer is ready
    const timer = setTimeout(() => {
      rowVirtualizer.scrollToIndex(currentRow, { align: 'center' });
    }, 50);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClick = useCallback(
    (weekNumber: number) => {
      setSelectedWeekNumber(
        selectedWeekNumber === weekNumber ? null : weekNumber
      );
    },
    [selectedWeekNumber, setSelectedWeekNumber]
  );

  const handleHover = useCallback(
    (weekNumber: number | null) => {
      setHoveredWeekNumber(weekNumber);
    },
    [setHoveredWeekNumber]
  );

  // Info bar content
  const displayWeek = hoveredWeekNumber ?? currentWeek;
  const displayBoundaries = useMemo(
    () => getWeekBoundaries(displayWeek),
    [displayWeek]
  );
  const isHovering = hoveredWeekNumber !== null;

  return (
    <div className="flex flex-col h-full bg-stone-50 dark:bg-stone-950">
      {/* Header */}
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

      {/* Virtualized Grid */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-auto"
        style={{ contain: 'strict' }}
      >
        <div
          className="relative mx-auto"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            // year label width (40px) + 52 cells + gaps
            width: 'fit-content',
            minWidth: '100%',
          }}
        >
          <div className="sticky left-0" style={{ width: 'fit-content', margin: '0 auto' }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const year = getYearForRow(virtualRow.index, WEEK1_YEAR);
              const isFirstRow = virtualRow.index === 0;
              // Show year label at first row and every 5 rows for readability
              const showYearLabel =
                isFirstRow || virtualRow.index % 5 === 0;

              return (
                <div
                  key={virtualRow.key}
                  className="absolute left-0 right-0 flex items-center"
                  style={{
                    top: `${virtualRow.start}px`,
                    height: `${virtualRow.size}px`,
                  }}
                >
                  {/* Year label */}
                  <div className="w-8 sm:w-10 flex-none text-right pr-1.5 sm:pr-2">
                    {showYearLabel && (
                      <span className="text-[8px] sm:text-[10px] text-stone-400 dark:text-stone-600 font-mono leading-none">
                        {year}
                      </span>
                    )}
                  </div>

                  {/* Week cells for this row */}
                  <div className="flex gap-[1px]">
                    {Array.from({ length: WEEKS_PER_ROW }, (_, col) => {
                      const weekNum = rowColToWeekNumber(
                        virtualRow.index,
                        col
                      );
                      if (weekNum > TOTAL_WEEKS) return null;

                      const weekId = `week-${weekNum}`;
                      const hasEntries = entryWeekIds
                        ? entryWeekIds.has(weekId)
                        : false;
                      const hasSynthesis = synthesisWeekIds
                        ? synthesisWeekIds.has(weekId)
                        : false;
                      const state = getWeekState(
                        weekNum,
                        currentWeek,
                        hasEntries,
                        hasSynthesis
                      );

                      return (
                        <WeekCell
                          key={weekNum}
                          weekNumber={weekNum}
                          state={state}
                          isSelected={selectedWeekNumber === weekNum}
                          onClick={handleClick}
                          onHover={handleHover}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
