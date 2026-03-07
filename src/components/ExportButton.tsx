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
      className="p-1.5 rounded-md text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors disabled:opacity-50"
      aria-label="Export all data"
    >
      <Download className={`w-4 h-4 ${exporting ? 'animate-pulse' : ''}`} />
    </button>
  );
}
