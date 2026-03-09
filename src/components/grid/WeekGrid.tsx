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

// Derive the year of Week 1 for year labels
const week1Boundaries = getWeekBoundaries(1);
const WEEK1_YEAR = parseInt(week1Boundaries.start.substring(0, 4));

export function WeekGrid() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentWeek = useMemo(() => getCurrentWeek(), []);
  const currentRow = useMemo(() => getRowForWeek(currentWeek), [currentWeek]);

  // Zustand state
  const selectedWeekNumber = useUIStore((s) => s.selectedWeekNumber);
  const setSelectedWeekNumber = useUIStore((s) => s.setSelectedWeekNumber);
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
    estimateSize: () => 14,
    overscan: 5,
  });

  // Auto-scroll to current week on mount
  useEffect(() => {
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

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto overflow-x-hidden"
      style={{ contain: 'strict' }}
    >
      <div
        className="relative mx-auto"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: 'fit-content',
        }}
      >
        <div>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const year = getYearForRow(virtualRow.index, WEEK1_YEAR);
            const isFirstRow = virtualRow.index === 0;
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
  );
}
