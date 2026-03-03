'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { getWeekBoundaries } from '@/lib/week-utils';
import { format, parseISO } from 'date-fns';

interface CardFrontProps {
  weekNumber: number;
}

export function CardFront({ weekNumber }: CardFrontProps) {
  const synthesis = useLiveQuery(
    () => db.syntheses.where('weekId').equals(`week-${weekNumber}`).first(),
    [weekNumber]
  );

  const { start, end } = getWeekBoundaries(weekNumber);
  const startDate = parseISO(start);
  const endDate = parseISO(end);

  // Format: "Jul 20 - Jul 26, 2025"
  const sameMonth = startDate.getMonth() === endDate.getMonth();
  const dateRange = sameMonth
    ? `${format(startDate, 'MMM d')} - ${format(endDate, 'd, yyyy')}`
    : `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-12 text-center select-none">
      {/* Week number */}
      <h2 className="text-4xl font-bold tracking-tight text-stone-800 dark:text-stone-100">
        Week {weekNumber}
      </h2>

      {/* Date range */}
      <p className="mt-2 text-sm text-stone-500 dark:text-stone-400 tracking-wide">
        {dateRange}
      </p>

      {/* AI headline (graceful degradation: only shown if synthesis exists) */}
      {synthesis?.headline && (
        <p className="mt-6 text-lg italic text-amber-700 dark:text-amber-400 max-w-xs leading-relaxed">
          {synthesis.headline}
        </p>
      )}

      {/* Decorative divider */}
      <div className="mt-auto pt-8">
        <div className="w-12 h-px bg-stone-300 dark:bg-stone-600 mx-auto" />
      </div>

      {/* Flip hint */}
      <p className="mt-3 text-xs text-stone-400 dark:text-stone-500">
        Click to flip
      </p>
    </div>
  );
}
