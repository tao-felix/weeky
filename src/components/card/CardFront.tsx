'use client';

import { getWeekBoundaries } from '@/lib/week-utils';
import { useSynthesis } from '@/hooks/use-api';
import { format, parseISO } from 'date-fns';

interface CardFrontProps {
  weekNumber: number;
}

export function CardFront({ weekNumber }: CardFrontProps) {
  const { synthesis } = useSynthesis(weekNumber);

  const { start, end } = getWeekBoundaries(weekNumber);
  const startDate = parseISO(start);
  const endDate = parseISO(end);

  const sameMonth = startDate.getMonth() === endDate.getMonth();
  const dateRange = sameMonth
    ? `${format(startDate, 'MMM d')} - ${format(endDate, 'd, yyyy')}`
    : `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-12 text-center select-none">
      <h2 className="font-[family-name:var(--font-display)] text-4xl italic text-[#1A1A1A] dark:text-[#E8E6E3]">
        Week {weekNumber}
      </h2>
      <p className="mt-2 text-sm text-[#6B6B6B] dark:text-stone-400 tracking-wide font-mono">
        {dateRange}
      </p>

      {synthesis?.headline && (
        <p className="mt-6 font-[family-name:var(--font-serif)] text-lg italic text-amber-700 dark:text-amber-400 max-w-xs leading-relaxed">
          {synthesis.headline}
        </p>
      )}

      <div className="mt-auto pt-8">
        <div className="w-12 h-px bg-[#E8E5E0] dark:bg-stone-600 mx-auto" />
      </div>
      <p className="mt-3 text-xs text-[#6B6B6B] dark:text-stone-500">
        Click to flip
      </p>
    </div>
  );
}
