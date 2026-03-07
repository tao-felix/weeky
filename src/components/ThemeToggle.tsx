'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { db } from '@/lib/db';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Read initial theme on mount
  useEffect(() => {
    async function loadTheme() {
      const stored = await db.settings.get('theme');
      let initial: 'light' | 'dark';

      if (stored && (stored.value === 'dark' || stored.value === 'light')) {
        initial = stored.value as 'light' | 'dark';
      } else {
        initial = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
      }

      setTheme(initial);
      applyTheme(initial);
      setMounted(true);
    }
    loadTheme();
  }, []);

  function applyTheme(t: 'light' | 'dark') {
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  async function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
    await db.settings.put({
      key: 'theme',
      value: next,
      updatedAt: new Date().toISOString(),
    });
  }

  // Avoid hydration mismatch -- render nothing until mounted
  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      className="p-1.5 rounded-md text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}
