'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { format } from 'date-fns';
import { MessageCircle, PenLine } from 'lucide-react';

interface CardBackProps {
  weekNumber: number;
}

export function CardBack({ weekNumber }: CardBackProps) {
  const entries = useLiveQuery(
    () => db.entries.where('weekId').equals(`week-${weekNumber}`).sortBy('createdAt'),
    [weekNumber]
  );

  return (
    <div className="flex flex-col h-full px-6 py-8 select-none">
      {/* Header */}
      <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-4">
        Captures
      </h3>

      {/* Entry list or empty state */}
      <div className="flex-1 overflow-y-auto max-h-[60vh] space-y-4">
        {entries === undefined ? (
          // Loading state
          <div className="flex items-center justify-center h-32">
            <div className="w-5 h-5 border-2 border-stone-300 border-t-stone-500 rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <p className="text-stone-400 dark:text-stone-500 text-sm">
              No captures yet for this week.
            </p>
            <p className="mt-1 text-stone-300 dark:text-stone-600 text-xs italic">
              This week is waiting for its story.
            </p>
          </div>
        ) : (
          // Entries
          entries.map((entry) => (
            <div
              key={entry.id}
              className="pb-3 border-b border-stone-100 dark:border-stone-800 last:border-b-0"
            >
              <div className="flex items-center gap-1.5 mb-1">
                {entry.type === 'reflection' ? (
                  <PenLine className="w-3 h-3 text-stone-400 dark:text-stone-500" />
                ) : (
                  <MessageCircle className="w-3 h-3 text-stone-400 dark:text-stone-500" />
                )}
                <time className="text-xs text-stone-400 dark:text-stone-500">
                  {format(new Date(entry.createdAt), 'EEE, MMM d \u00b7 h:mm a')}
                </time>
              </div>
              <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                {entry.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Flip hint */}
      <p className="mt-4 text-xs text-stone-400 dark:text-stone-500 text-center">
        Click to flip back
      </p>
    </div>
  );
}
