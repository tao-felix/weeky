'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { getCurrentWeek, getWeekBoundaries } from '@/lib/week-utils';
import { format } from 'date-fns';
import { MessageCircle, PenLine, Sparkles, BookOpen, CheckSquare, MapPin } from 'lucide-react';
import type { Entry, EntryType } from '@/lib/types';
import { QuickCapture } from '@/components/capture/QuickCapture';
import { ReflectionEditor } from '@/components/capture/ReflectionEditor';
import { SynthesizeButton } from '@/components/card/SynthesizeButton';
import { SynthesisView } from '@/components/card/SynthesisView';

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
  const [showSynthesis, setShowSynthesis] = useState(false);

  const entries = useLiveQuery(
    () => db.entries.where('weekId').equals(`week-${weekNumber}`).sortBy('createdAt'),
    [weekNumber]
  );

  const synthesis = useLiveQuery(
    () => db.syntheses.where('weekId').equals(`week-${weekNumber}`).first(),
    [weekNumber]
  );

  // Separate diary entries from regular captures
  const diaryEntries = entries?.filter(e => e.type === 'diary') ?? [];
  const captureEntries = entries?.filter(e => e.type !== 'diary') ?? [];
  const hasEntries = entries !== undefined && entries.length > 0;
  const hasSynthesis = !!synthesis;

  // Get week metadata for location/theme display
  const week = useLiveQuery(
    () => db.weeks.where('weekNumber').equals(weekNumber).first(),
    [weekNumber]
  );

  const startDate = new Date(start + 'T00:00:00');
  const endDate = new Date(end + 'T00:00:00');

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-[#1A1A1A] border-r border-[#E8E5E0] dark:border-stone-800">
      {/* Week header */}
      <div className="flex-none px-5 pt-6 pb-4 border-b border-stone-100 dark:border-stone-800">
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

        {/* AI headline */}
        {synthesis?.headline && (
          <p className="mt-3 text-sm italic text-amber-700 dark:text-amber-400 leading-relaxed">
            {synthesis.headline}
          </p>
        )}
      </div>

      {/* Capture input area -- current week only */}
      {isCurrentWeek && (
        <div className="flex-none px-5 py-4 border-b border-stone-100 dark:border-stone-800">
          {/* Mode toggle tabs */}
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

      {/* Synthesis toggle + button */}
      {hasEntries && (
        <div className="flex-none px-5 py-3 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          {hasSynthesis ? (
            <button
              type="button"
              onClick={() => setShowSynthesis(!showSynthesis)}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                showSynthesis
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              {showSynthesis ? 'Show captures' : 'Show synthesis'}
            </button>
          ) : (
            <span />
          )}
          <SynthesizeButton
            weekNumber={weekNumber}
            entries={entries ?? []}
            hasSynthesis={hasSynthesis}
            onComplete={() => setShowSynthesis(true)}
          />
        </div>
      )}

      {/* Entries / Synthesis list */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {showSynthesis && synthesis ? (
          <SynthesisView synthesis={synthesis} />
        ) : entries === undefined ? (
          <div className="flex items-center justify-center h-24">
            <div className="w-5 h-5 border-2 border-stone-300 border-t-stone-500 rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-stone-400 dark:text-stone-500 text-sm">
              {isFutureWeek
                ? 'This week hasn\u2019t arrived yet.'
                : 'No captures yet.'}
            </p>
            <p className="mt-1 text-stone-300 dark:text-stone-600 text-xs italic">
              {isFutureWeek
                ? 'It\u2019s still on the horizon.'
                : 'This week is waiting for its story.'}
            </p>
          </div>
        ) : (
          <>
            {/* Diary entries (imported from Obsidian) */}
            {diaryEntries.map((entry) => (
              <div
                key={entry.id}
                className="pb-4 border-b border-stone-200 dark:border-stone-700 last:border-b-0"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <BookOpen className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    Diary
                  </span>
                  {entry.metadata?.location && (
                    <span className="text-xs text-stone-400 dark:text-stone-500">
                      · {entry.metadata.location}
                    </span>
                  )}
                </div>
                <div className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto prose prose-sm dark:prose-invert prose-stone">
                  {entry.content}
                </div>
              </div>
            ))}

            {/* Regular captures */}
            {captureEntries.map((entry) => (
              <div
                key={entry.id}
                className="pb-3 border-b border-stone-100 dark:border-stone-800 last:border-b-0"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <EntryIcon type={entry.type} />
                  <time className="text-xs text-stone-400 dark:text-stone-500">
                    {format(new Date(entry.createdAt), 'EEE, MMM d · h:mm a')}
                  </time>
                </div>
                <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-wrap">
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

function EntryIcon({ type }: { type: EntryType }) {
  const cls = "w-3 h-3 text-stone-400 dark:text-stone-500";
  switch (type) {
    case 'reflection': return <PenLine className={cls} />;
    case 'task': return <CheckSquare className={cls} />;
    case 'diary': return <BookOpen className={cls} />;
    default: return <MessageCircle className={cls} />;
  }
}
