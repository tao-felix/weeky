'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchEntries, fetchEntryCounts, fetchWeek, fetchSetting, fetchSynthesis, fetchSearchResults, type EntryRow, type WeekRow, type SynthesisRow, type SearchResult } from '@/lib/api';

// Simple polling interval for reactivity (ms)
const POLL_INTERVAL = 2000;

export function useEntries(weekNumber: number) {
  const [entries, setEntries] = useState<EntryRow[] | undefined>(undefined);

  const refresh = useCallback(() => {
    fetchEntries(weekNumber).then(setEntries);
  }, [weekNumber]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [refresh]);

  return { entries, refresh };
}

export function useEntryCounts() {
  const [counts, setCounts] = useState<Map<number, number>>(new Map());

  const refresh = useCallback(() => {
    fetchEntryCounts().then(rows => {
      const map = new Map<number, number>();
      for (const r of rows) map.set(r.week_number, r.count);
      setCounts(map);
    });
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [refresh]);

  return { counts, refresh };
}

export function useWeek(weekNumber: number) {
  const [week, setWeek] = useState<WeekRow | null | undefined>(undefined);

  useEffect(() => {
    fetchWeek(weekNumber).then(setWeek);
  }, [weekNumber]);

  return week;
}

export function useSynthesis(weekNumber: number) {
  const [synthesis, setSynthesis] = useState<SynthesisRow | null | undefined>(undefined);

  const refresh = useCallback(() => {
    fetchSynthesis(weekNumber).then(setSynthesis);
  }, [weekNumber]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [refresh]);

  return { synthesis, refresh };
}

export function useSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      fetchSearchResults(query).then(r => {
        setResults(r);
        setLoading(false);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return { results, loading };
}

export function useSetting(key: string) {
  const [value, setValue] = useState<unknown | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchSetting(key).then(result => {
      setValue(result?.value ?? null);
      setLoaded(true);
    });
  }, [key]);

  return { value, loaded };
}
