'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { runSynthesis, saveSynthesis } from '@/lib/synthesis-utils';
import type { Entry } from '@/lib/types';

interface SynthesizeButtonProps {
  weekNumber: number;
  entries: Entry[];
  hasSynthesis: boolean;
  onComplete?: () => void;
}

type SynthesizeStatus = 'idle' | 'streaming' | 'error';

export function SynthesizeButton({
  weekNumber,
  entries,
  hasSynthesis,
  onComplete,
}: SynthesizeButtonProps) {
  const [status, setStatus] = useState<SynthesizeStatus>('idle');
  const [streamText, setStreamText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-clear error after 3 seconds
  useEffect(() => {
    if (status !== 'error') return;
    const timer = setTimeout(() => {
      setStatus('idle');
      setErrorMsg('');
    }, 3000);
    return () => clearTimeout(timer);
  }, [status]);

  async function handleSynthesize(e: React.MouseEvent) {
    e.stopPropagation();
    setStatus('streaming');
    setStreamText('');
    setErrorMsg('');

    try {
      const result = await runSynthesis({
        weekNumber,
        entries,
        onProgress: (text) => setStreamText(text),
      });

      await saveSynthesis({
        weekNumber,
        headline: result.headline,
        highlights: result.highlights,
      });

      setStatus('idle');
      onComplete?.();
    } catch (err) {
      console.error('Synthesis failed:', err);
      setStatus('error');
      setErrorMsg('Failed -- try again');
    }
  }

  const isDisabled = status === 'streaming' || entries.length === 0;

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleSynthesize}
        disabled={isDisabled}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
          isDisabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-amber-200 dark:hover:bg-amber-800'
        } bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300`}
      >
        {status === 'streaming' ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin" />
            Synthesizing...
          </>
        ) : (
          <>
            <Sparkles className="w-3 h-3" />
            {hasSynthesis ? 'Re-synthesize' : 'Synthesize'}
          </>
        )}
      </button>

      {status === 'error' && errorMsg && (
        <span className="text-xs text-red-500 dark:text-red-400">
          {errorMsg}
        </span>
      )}
    </div>
  );
}
