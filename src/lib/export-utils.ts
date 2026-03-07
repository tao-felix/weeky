import { db } from './db';

export async function exportAllData(): Promise<void> {
  const [entries, weeks, syntheses, settings] = await Promise.all([
    db.entries.toArray(),
    db.weeks.toArray(),
    db.syntheses.toArray(),
    db.settings.toArray(),
  ]);

  const exportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      entries,
      weeks,
      syntheses,
      settings,
    },
  };

  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });

  const today = new Date().toISOString().slice(0, 10);
  const filename = `weeky-export-${today}.json`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
