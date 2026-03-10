'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { fetchSetting, saveSetting } from '@/lib/api';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Read initial theme on mount
  useEffect(() => {
    async function loadTheme() {
      const stored = await fetchSetting('theme');
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
    await saveSetting('theme', next);
  }

  // Avoid hydration mismatch -- render nothing until mounted
  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center justify-center h-8 w-8 rounded-md text-[#6B6B6B] hover:text-[#1A1A1A] dark:text-stone-500 dark:hover:text-stone-300 hover:bg-[#F0EDE8] dark:hover:bg-stone-800 transition-colors"
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
