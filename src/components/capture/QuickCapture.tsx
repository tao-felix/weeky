'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send } from 'lucide-react';
import { createQuickCapture } from '@/lib/capture-utils';

interface QuickCaptureProps {
  weekNumber: number;
}

export function QuickCapture({ weekNumber }: QuickCaptureProps) {
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(async () => {
    const trimmed = value.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createQuickCapture({ content: trimmed, weekNumber });
      setValue('');
      // Re-focus input after submit for rapid capture
      inputRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  }, [value, weekNumber, isSubmitting]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isEmpty = value.trim().length === 0;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 dark:border-stone-700 dark:bg-stone-900">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What's on your mind this week?"
        disabled={isSubmitting}
        className="flex-1 bg-transparent text-sm text-stone-700 placeholder:text-stone-400 outline-none dark:text-stone-300 dark:placeholder:text-stone-500"
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isEmpty || isSubmitting}
        aria-label="Send capture"
        className="flex-shrink-0 rounded-md p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 disabled:cursor-not-allowed disabled:opacity-40 dark:text-stone-500 dark:hover:bg-stone-800 dark:hover:text-stone-300"
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  );
}
