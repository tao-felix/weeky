// Entry -- individual captures (quick thoughts, reflections)
export interface Entry {
  id: string; // UUID via crypto.randomUUID()
  weekId: string; // links to Week.id
  content: string;
  type: "quick" | "reflection";
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  deviceId: string; // for future sync
}

// Week -- week metadata
export interface Week {
  id: string; // UUID
  weekNumber: number; // 943, 944, etc.
  startDate: string; // ISO date (Sunday)
  endDate: string; // ISO date (Saturday)
  createdAt: string;
  updatedAt: string;
  deviceId: string;
}

// Synthesis -- AI-generated summaries (separate store from entries)
export interface Synthesis {
  id: string;
  weekId: string; // links to Week.id
  headline: string; // "Week 943: Naval & Rebranding"
  highlights: string[]; // key themes/moments
  model: string; // which AI model was used
  createdAt: string;
  updatedAt: string;
  deviceId: string;
}

// Setting -- user preferences (key-value store)
export interface Setting {
  key: string; // primary key
  value: unknown;
  updatedAt: string;
}
