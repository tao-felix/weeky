'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { exportAllData } from '@/lib/export-utils';

export function ExportButton() {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (exporting) return;
    setExporting(true);
    try {
      await exportAllData();
    } catch (error) {
      console.error('Failed to export data:', error);
    } finally {
      setExporting(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="inline-flex items-center justify-center h-8 w-8 rounded-md text-[#6B6B6B] hover:text-[#1A1A1A] dark:text-stone-500 dark:hover:text-stone-300 hover:bg-[#F0EDE8] dark:hover:bg-stone-800 transition-colors disabled:opacity-50"
      aria-label="Export all data"
    >
      <Download className={`w-4 h-4 ${exporting ? 'animate-pulse' : ''}`} />
    </button>
  );
}
