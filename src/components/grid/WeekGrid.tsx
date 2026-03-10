'use client';

import { useRef, useCallback, useEffect, useMemo, useState } from 'react';
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

const YEAR_LABEL_WIDTH = 40; // px
const CELL_GAP = 1; // px

export function WeekGrid() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentWeek = useMemo(() => getCurrentWeek(), []);
  const currentRow = useMemo(() => getRowForWeek(currentWeek), [currentWeek]);

  // Dynamic cell size based on container width
  const [cellSize, setCellSize] = useState(9);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const compute = () => {
      const w = el.clientWidth;
      const available = w - YEAR_LABEL_WIDTH - (WEEKS_PER_ROW - 1) * CELL_GAP;
      setCellSize(Math.max(4, Math.floor(available / WEEKS_PER_ROW)));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const rowHeight = cellSize + CELL_GAP;

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
    estimateSize: () => rowHeight,
    overscan: 5,
  });

  // Re-measure when cell size changes
  useEffect(() => {
    rowVirtualizer.measure();
  }, [cellSize]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to current week on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      rowVirtualizer.scrollToIndex(currentRow, { align: 'center' });
    }, 100);
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
        className="relative"
        style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const year = getYearForRow(virtualRow.index, WEEK1_YEAR);
          const isFirstRow = virtualRow.index === 0;
          const showYearLabel = isFirstRow || virtualRow.index % 5 === 0;

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
              <div
                className="flex-none text-right pr-1.5"
                style={{ width: YEAR_LABEL_WIDTH }}
              >
                {showYearLabel && (
                  <span className="text-[8px] sm:text-[10px] text-stone-400 dark:text-stone-600 font-mono leading-none">
                    {year}
                  </span>
                )}
              </div>

              {/* Week cells — fill remaining width */}
              <div className="flex-1 flex" style={{ gap: CELL_GAP }}>
                {Array.from({ length: WEEKS_PER_ROW }, (_, col) => {
                  const weekNum = rowColToWeekNumber(virtualRow.index, col);
                  if (weekNum > TOTAL_WEEKS) return null;

                  const weekId = `week-${weekNum}`;
                  const hasEntries = entryWeekIds ? entryWeekIds.has(weekId) : false;
                  const hasSynthesis = synthesisWeekIds ? synthesisWeekIds.has(weekId) : false;
                  const state = getWeekState(weekNum, currentWeek, hasEntries, hasSynthesis);

                  return (
                    <WeekCell
                      key={weekNum}
                      weekNumber={weekNum}
                      state={state}
                      size={cellSize}
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
  );
}
