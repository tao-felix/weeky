'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, MessageCircle, PenLine, BookOpen, Sparkles, MapPin } from 'lucide-react';
import { useSearch } from '@/hooks/use-api';
import { useUIStore } from '@/stores/ui-store';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { results, loading } = useSearch(query);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => setSelectedIdx(0), [results]);

  const selectResult = useCallback((weekNumber: number) => {
    useUIStore.getState().setSelectedWeekNumber(weekNumber);
    onClose();
  }, [onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && results[selectedIdx]) {
      e.preventDefault();
      selectResult(results[selectedIdx].week_number);
    }
  };

  if (!open) return null;

  const iconFor = (type: string) => {
    const cls = 'w-3.5 h-3.5 flex-shrink-0';
    switch (type) {
      case 'reflection': return <PenLine className={`${cls} text-stone-400`} />;
      case 'diary': return <BookOpen className={`${cls} text-amber-500`} />;
      case 'synthesis': return <Sparkles className={`${cls} text-amber-500`} />;
      case 'week': return <MapPin className={`${cls} text-stone-400`} />;
      default: return <MessageCircle className={`${cls} text-stone-400`} />;
    }
  };

  const highlight = (text: string, q: string) => {
    if (!q || q.length < 2) return text;
    const snippet = text.length > 120 ? text.slice(0, 120) + '...' : text;
    const idx = snippet.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return snippet;
    return (
      <>
        {snippet.slice(0, idx)}
        <span className="text-amber-600 dark:text-amber-400 font-medium">{snippet.slice(idx, idx + q.length)}</span>
        {snippet.slice(idx + q.length)}
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative z-10 w-full max-w-lg mx-4 bg-[#FAF8F5] dark:bg-[#1A1A1A] rounded-xl shadow-2xl border border-[#E8E5E0] dark:border-stone-700 overflow-hidden"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E8E5E0] dark:border-stone-700">
          <Search className="w-4 h-4 text-[#6B6B6B] dark:text-stone-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search your weeks..."
            className="flex-1 bg-transparent font-[family-name:var(--font-serif)] text-sm text-[#1A1A1A] dark:text-[#E8E6E3] placeholder:text-stone-400 dark:placeholder:text-stone-500 outline-none"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {loading && query.length >= 2 && (
            <div className="flex items-center justify-center py-8">
              <div className="w-4 h-4 border-2 border-stone-300 border-t-stone-500 rounded-full animate-spin" />
            </div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="py-8 text-center">
              <p className="font-[family-name:var(--font-serif)] text-sm italic text-stone-400 dark:text-stone-500">
                No results found
              </p>
            </div>
          )}

          {!loading && results.map((r, i) => (
            <button
              key={`${r.result_type}-${r.id}`}
              type="button"
              onClick={() => selectResult(r.week_number)}
              className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                i === selectedIdx
                  ? 'bg-[#F0EDE8] dark:bg-stone-800'
                  : 'hover:bg-[#F0EDE8]/50 dark:hover:bg-stone-800/50'
              }`}
            >
              <div className="mt-0.5">{iconFor(r.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-[family-name:var(--font-serif)] text-sm text-stone-700 dark:text-stone-300 leading-relaxed truncate">
                  {highlight(r.content, query)}
                </p>
                <p className="mt-0.5 text-xs text-[#6B6B6B] dark:text-stone-500 font-mono">
                  Week {r.week_number}
                  {r.result_type === 'entry' && ` · ${r.type}`}
                </p>
              </div>
            </button>
          ))}

          {query.length < 2 && (
            <div className="py-8 text-center">
              <p className="text-xs text-stone-400 dark:text-stone-500">
                Type at least 2 characters to search
              </p>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-[#E8E5E0] dark:border-stone-700 flex items-center gap-3 text-[10px] text-stone-400 dark:text-stone-500">
          <span><kbd className="px-1 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="px-1 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-mono">↵</kbd> select</span>
          <span><kbd className="px-1 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-mono">esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
