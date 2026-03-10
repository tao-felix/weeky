'use client';

import React, { memo } from 'react';
import type { WeekState } from '@/lib/grid-utils';

interface WeekCellProps {
  weekNumber: number;
  state: WeekState;
  size: number;
  isSelected: boolean;
  onClick: (weekNumber: number) => void;
  onHover: (weekNumber: number | null) => void;
}

const stateStyles: Record<WeekState, string> = {
  empty: 'bg-[#DCD0C0] dark:bg-stone-700',
  'has-captures': 'bg-[#C08283] dark:bg-[#C08283]',
  synthesized: 'bg-[#8BBFBC] dark:bg-[#8BBFBC]',
  current: 'bg-[#FEC66E] dark:bg-[#FEC66E] ring-2 ring-[#FEC66E]/50 dark:ring-[#FEC66E]/50 z-10',
  future: 'bg-[#F0EDE8] dark:bg-[#242424]',
};

function WeekCellComponent({
  weekNumber,
  state,
  size,
  isSelected,
  onClick,
  onHover,
}: WeekCellProps) {
  return (
    <div
      className={`
        rounded-[1px]
        transition-transform duration-100
        ${stateStyles[state]}
        ${isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400 z-10' : ''}
        ${state !== 'future' ? 'cursor-pointer hover:brightness-110 hover:scale-125' : 'cursor-default'}
      `}
      style={{ width: size, height: size }}
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
    prev.size === next.size &&
    prev.isSelected === next.isSelected
  );
});
