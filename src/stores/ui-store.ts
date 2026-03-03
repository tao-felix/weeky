import { create } from 'zustand';

interface UIState {
  selectedWeekNumber: number | null;
  setSelectedWeekNumber: (weekNumber: number | null) => void;
  hoveredWeekNumber: number | null;
  setHoveredWeekNumber: (weekNumber: number | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  selectedWeekNumber: null,
  setSelectedWeekNumber: (weekNumber) => set({ selectedWeekNumber: weekNumber }),
  hoveredWeekNumber: null,
  setHoveredWeekNumber: (weekNumber) => set({ hoveredWeekNumber: weekNumber }),
}));
