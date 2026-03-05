'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { getCurrentWeek } from '@/lib/week-utils';
import { format } from 'date-fns';
import { MessageCircle, PenLine, Sparkles } from 'lucide-react';
import { QuickCapture } from '@/components/capture/QuickCapture';
import { ReflectionEditor } from '@/components/capture/ReflectionEditor';
import { SynthesizeButton } from './SynthesizeButton';
import { SynthesisView } from './SynthesisView';

interface CardBackProps {
  weekNumber: number;
}

type CaptureMode = 'quick' | 'reflect';
type BackViewMode = 'captures' | 'synthesis';

export function CardBack({ weekNumber }: CardBackProps) {
  const isCurrentWeek = weekNumber === getCurrentWeek();
  const [captureMode, setCaptureMode] = useState<CaptureMode>('quick');
  const [viewMode, setViewMode] = useState<BackViewMode>('captures');

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

  return (
    <div className="flex flex-col h-full px-6 py-8 select-none">
      {/* Header with view toggle and synthesize button */}
      <div className="flex items-center justify-between mb-4">
        {/* Left: View mode tabs or static header */}
        {hasSynthesis ? (
          <div className="flex gap-1 rounded-md bg-stone-100 p-0.5 dark:bg-stone-800">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setViewMode('captures'); }}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === 'captures'
                  ? 'bg-white text-stone-700 shadow-sm dark:bg-stone-700 dark:text-stone-200'
                  : 'text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300'
              }`}
            >
              Captures
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setViewMode('synthesis'); }}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === 'synthesis'
                  ? 'bg-white text-stone-700 shadow-sm dark:bg-stone-700 dark:text-stone-200'
                  : 'text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              Synthesis
            </button>
          </div>
        ) : (
          <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500">
            Captures
          </h3>
        )}

        {/* Right: Synthesize button (shown when entries exist) */}
        {hasEntries && (
          <SynthesizeButton
            weekNumber={weekNumber}
            entries={entries ?? []}
            hasSynthesis={hasSynthesis}
            onComplete={() => setViewMode('synthesis')}
          />
        )}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto max-h-[60vh] space-y-4">
        {viewMode === 'synthesis' && synthesis ? (
          <SynthesisView synthesis={synthesis} />
        ) : (
          <>
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
                  <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-wrap">
                    {entry.content}
                  </p>
                </div>
              ))
            )}
          </>
        )}
      </div>

      {/* Capture area -- current week only */}
      {isCurrentWeek && (
        <div className="mt-4 space-y-2">
          {/* Mode toggle tabs */}
          <div className="flex gap-1 rounded-md bg-stone-100 p-0.5 dark:bg-stone-800">
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

          {/* Active capture component */}
          {captureMode === 'quick' ? (
            <QuickCapture weekNumber={weekNumber} />
          ) : (
            <ReflectionEditor weekNumber={weekNumber} />
          )}
        </div>
      )}

      {/* Flip hint */}
      <p className="mt-4 text-xs text-stone-400 dark:text-stone-500 text-center">
        Click to flip back
      </p>
    </div>
  );
}
