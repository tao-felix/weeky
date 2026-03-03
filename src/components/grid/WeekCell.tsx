'use client';

import React, { memo } from 'react';
import type { WeekState } from '@/lib/grid-utils';

interface WeekCellProps {
  weekNumber: number;
  state: WeekState;
  isSelected: boolean;
  onClick: (weekNumber: number) => void;
  onHover: (weekNumber: number | null) => void;
}

const stateStyles: Record<WeekState, string> = {
  empty: 'bg-stone-300 dark:bg-stone-700',
  'has-captures': 'bg-amber-400 dark:bg-amber-600',
  synthesized: 'bg-emerald-500 dark:bg-emerald-600',
  current: 'bg-orange-500 dark:bg-orange-500 ring-2 ring-orange-300 dark:ring-orange-400 z-10',
  future: 'bg-stone-100 dark:bg-stone-900',
};

function WeekCellComponent({
  weekNumber,
  state,
  isSelected,
  onClick,
  onHover,
}: WeekCellProps) {
  return (
    <div
      className={`
        w-[7px] h-[7px] sm:w-[10px] sm:h-[10px] md:w-[11px] md:h-[11px]
        rounded-[1px]
        transition-transform duration-100
        ${stateStyles[state]}
        ${isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400 z-10' : ''}
        ${state !== 'future' ? 'cursor-pointer hover:brightness-110 hover:scale-125' : 'cursor-default'}
      `}
      title={`Week ${weekNumber}`}
      aria-label={`Week ${weekNumber}, ${state}`}
      role="button"
      tabIndex={state !== 'future' ? 0 : -1}
      onClick={() => {
        if (state !== 'future') onClick(weekNumber);
      }}
      onMouseEnter={() => onHover(weekNumber)}
      onMouseLeave={() => onHover(null)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && state !== 'future') onClick(weekNumber);
      }}
    />
  );
}

export const WeekCell = memo(WeekCellComponent, (prev, next) => {
  return (
    prev.weekNumber === next.weekNumber &&
    prev.state === next.state &&
    prev.isSelected === next.isSelected
  );
});
