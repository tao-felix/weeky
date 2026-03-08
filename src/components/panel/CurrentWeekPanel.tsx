'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { getCurrentWeek, getWeekBoundaries } from '@/lib/week-utils';
import { format } from 'date-fns';
import { MessageCircle, PenLine, Sparkles } from 'lucide-react';
import { QuickCapture } from '@/components/capture/QuickCapture';
import { ReflectionEditor } from '@/components/capture/ReflectionEditor';
import { SynthesizeButton } from '@/components/card/SynthesizeButton';
import { SynthesisView } from '@/components/card/SynthesisView';

type CaptureMode = 'quick' | 'reflect';

export function CurrentWeekPanel() {
  const weekNumber = getCurrentWeek();
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

  const hasEntries = entries !== undefined && entries.length > 0;
  const hasSynthesis = !!synthesis;

  const startDate = new Date(start + 'T00:00:00');
  const endDate = new Date(end + 'T00:00:00');

  return (
    <div className="flex flex-col h-full bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800">
      {/* Week header */}
      <div className="flex-none px-5 pt-6 pb-4 border-b border-stone-100 dark:border-stone-800">
        <p className="text-xs font-medium uppercase tracking-widest text-stone-400 dark:text-stone-500">
          This Week
        </p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-stone-800 dark:text-stone-100">
          Week {weekNumber}
        </h2>
        <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500 font-mono">
          {format(startDate, 'MMM d')} – {format(endDate, 'MMM d, yyyy')}
        </p>

        {/* AI headline */}
        {synthesis?.headline && (
          <p className="mt-3 text-sm italic text-amber-700 dark:text-amber-400 leading-relaxed">
            {synthesis.headline}
          </p>
        )}
      </div>

      {/* Capture input area */}
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
              No captures yet.
            </p>
            <p className="mt-1 text-stone-300 dark:text-stone-600 text-xs italic">
              This week is waiting for its story.
            </p>
          </div>
        ) : (
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
                  {format(new Date(entry.createdAt), 'EEE, MMM d · h:mm a')}
                </time>
              </div>
              <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-wrap">
                {entry.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
