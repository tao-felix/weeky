'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { PenLine } from 'lucide-react';
import { createReflection } from '@/lib/capture-utils';

interface ReflectionEditorProps {
  weekNumber: number;
}

const DRAFT_KEY_PREFIX = 'weeky-reflection-draft-';

export function ReflectionEditor({ weekNumber }: ReflectionEditorProps) {
  const draftKey = `${DRAFT_KEY_PREFIX}${weekNumber}`;
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const draft = localStorage.getItem(draftKey);
      if (draft) {
        setValue(draft);
      }
    } catch {
      // localStorage unavailable — ignore
    }
  }, [draftKey]);

  // Autosave draft to localStorage (debounced 500ms)
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      try {
        if (value.trim()) {
          localStorage.setItem(draftKey, value);
        } else {
          localStorage.removeItem(draftKey);
        }
      } catch {
        // localStorage unavailable — ignore
      }
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, draftKey]);

  const handleSave = useCallback(async () => {
    const trimmed = value.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createReflection({ content: trimmed, weekNumber });
      setValue('');
      // Clear draft from localStorage after successful save
      try {
        localStorage.removeItem(draftKey);
      } catch {
        // ignore
      }
      textareaRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  }, [value, weekNumber, isSubmitting, draftKey]);

  const isEmpty = value.trim().length === 0;

  return (
    <div className="rounded-lg border border-[#E8E5E0] bg-[#FAF8F5] p-3 dark:border-stone-700 dark:bg-stone-800/50">
      {/* Header */}
      <div className="mb-2 flex items-center gap-1.5">
        <PenLine className="h-3.5 w-3.5 text-stone-500 dark:text-stone-400" />
        <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
          Weekly Reflection
        </span>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Reflect on your week..."
        disabled={isSubmitting}
        rows={4}
        className="w-full resize-y rounded-md border border-[#E8E5E0] bg-white px-3 py-2 font-[family-name:var(--font-serif)] text-sm text-stone-700 placeholder:text-stone-400 outline-none focus:border-stone-400 dark:border-stone-600 dark:bg-[#242424] dark:text-stone-300 dark:placeholder:text-stone-500 dark:focus:border-stone-500"
      />

      {/* Save button */}
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isEmpty || isSubmitting}
          className="rounded-md bg-stone-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-stone-600 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-stone-600 dark:hover:bg-stone-500"
        >
          {isSubmitting ? 'Saving...' : 'Save Reflection'}
        </button>
      </div>
    </div>
  );
}
