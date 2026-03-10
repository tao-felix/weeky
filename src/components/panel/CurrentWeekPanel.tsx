'use client';

import { useState } from 'react';
import { getCurrentWeek, getWeekBoundaries } from '@/lib/week-utils';
import { useEntries, useWeek } from '@/hooks/use-api';
import { format } from 'date-fns';
import { MessageCircle, PenLine, Sparkles, BookOpen, CheckSquare, MapPin } from 'lucide-react';
import { QuickCapture } from '@/components/capture/QuickCapture';
import { ReflectionEditor } from '@/components/capture/ReflectionEditor';

type CaptureMode = 'quick' | 'reflect';

interface CurrentWeekPanelProps {
  weekNumber: number;
}

export function CurrentWeekPanel({ weekNumber }: CurrentWeekPanelProps) {
  const currentWeek = getCurrentWeek();
  const isCurrentWeek = weekNumber === currentWeek;
  const isFutureWeek = weekNumber > currentWeek;
  const { start, end } = getWeekBoundaries(weekNumber);
  const [captureMode, setCaptureMode] = useState<CaptureMode>('quick');

  const { entries } = useEntries(weekNumber);
  const week = useWeek(weekNumber);

  const diaryEntries = entries?.filter(e => e.type === 'diary') ?? [];
  const captureEntries = entries?.filter(e => e.type !== 'diary') ?? [];
  const hasEntries = entries !== undefined && entries.length > 0;

  const startDate = new Date(start + 'T00:00:00');
  const endDate = new Date(end + 'T00:00:00');

  return (
    <div className="flex flex-col h-full w-full bg-[#FAF8F5] dark:bg-[#1A1A1A] border-r border-[#E8E5E0] dark:border-stone-800">
      {/* Week header */}
      <div className="flex-none px-5 pt-6 pb-4 border-b border-[#E8E5E0] dark:border-stone-800">
        <p className="text-xs font-medium uppercase tracking-widest text-stone-400 dark:text-stone-500">
          {isCurrentWeek ? 'This Week' : isFutureWeek ? 'Future Week' : 'Past Week'}
        </p>
        <h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl italic text-[#1A1A1A] dark:text-[#E8E6E3]">
          Week {weekNumber}
        </h2>
        <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500 font-mono">
          {format(startDate, 'MMM d')} – {format(endDate, 'MMM d, yyyy')}
        </p>

        {/* Location & theme from week metadata */}
        {week?.location && (
          <div className="mt-2 flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500">
            <MapPin className="w-3 h-3" />
            <span>{week.location}</span>
            {week.theme && <span className="ml-1">· {week.theme}</span>}
          </div>
        )}
      </div>

      {/* Capture input area -- current week only */}
      {isCurrentWeek && (
        <div className="flex-none px-5 py-4 border-b border-[#E8E5E0] dark:border-stone-800">
          <div className="flex gap-1 rounded-md bg-stone-100 p-0.5 dark:bg-stone-800 mb-3">
            <button
              type="button"
              onClick={() => setCaptureMode('quick')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                captureMode === 'quick'
                  ? 'bg-white text-stone-700 shadow-sm dark:bg-stone-700 dark:text-stone-200'
                  : 'text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300'
              }`}
            >
              <MessageCircle className="h-3 w-3" />
              Quick
            </button>
            <button
              type="button"
              onClick={() => setCaptureMode('reflect')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                captureMode === 'reflect'
                  ? 'bg-white text-stone-700 shadow-sm dark:bg-stone-700 dark:text-stone-200'
                  : 'text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300'
              }`}
            >
              <PenLine className="h-3 w-3" />
              Reflect
            </button>
          </div>

          {captureMode === 'quick' ? (
            <QuickCapture weekNumber={weekNumber} />
          ) : (
            <ReflectionEditor weekNumber={weekNumber} />
          )}
        </div>
      )}

      {/* Entries list */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {entries === undefined ? (
          <div className="flex items-center justify-center h-24">
            <div className="w-5 h-5 border-2 border-stone-300 border-t-stone-500 rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-stone-400 dark:text-stone-500 text-sm">
              {isFutureWeek ? 'This week hasn\u2019t arrived yet.' : 'No captures yet.'}
            </p>
            <p className="mt-1 text-stone-300 dark:text-stone-600 text-xs italic font-[family-name:var(--font-serif)]">
              {isFutureWeek ? 'It\u2019s still on the horizon.' : 'This week is waiting for its story.'}
            </p>
          </div>
        ) : (
          <>
            {/* Diary entries (imported from Obsidian) */}
            {diaryEntries.map((entry) => {
              const meta = typeof entry.metadata === 'string' ? JSON.parse(entry.metadata) : entry.metadata;
              return (
                <div
                  key={entry.id}
                  className="pb-4 border-b border-[#E8E5E0] dark:border-stone-700 last:border-b-0"
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <BookOpen className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                      Diary
                    </span>
                    {meta?.location && (
                      <span className="text-xs text-stone-400 dark:text-stone-500">
                        · {meta.location}
                      </span>
                    )}
                  </div>
                  <div className="font-[family-name:var(--font-serif)] text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {entry.content}
                  </div>
                </div>
              );
            })}

            {/* Regular captures */}
            {captureEntries.map((entry) => (
              <div
                key={entry.id}
                className="pb-3 border-b border-[#E8E5E0] dark:border-stone-800 last:border-b-0"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <EntryIcon type={entry.type} />
                  <time className="text-xs text-stone-400 dark:text-stone-500">
                    {format(new Date(entry.created_at), 'EEE, MMM d · h:mm a')}
                  </time>
                </div>
                <p className="font-[family-name:var(--font-serif)] text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-wrap">
                  {entry.content}
                </p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function EntryIcon({ type }: { type: string }) {
  const cls = "w-3 h-3 text-stone-400 dark:text-stone-500";
  switch (type) {
    case 'reflection': return <PenLine className={cls} />;
    case 'task': return <CheckSquare className={cls} />;
    case 'diary': return <BookOpen className={cls} />;
    default: return <MessageCircle className={cls} />;
  }
}
