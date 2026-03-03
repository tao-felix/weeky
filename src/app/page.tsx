'use client';

import { WeekGrid } from '@/components/grid/WeekGrid';

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-stone-50 dark:bg-stone-950">
      <WeekGrid />
    </div>
  );
}
