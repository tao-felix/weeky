// Grid layout constants
export const TOTAL_WEEKS = 4000;
export const WEEKS_PER_ROW = 52; // 52 weeks per year row
export const TOTAL_ROWS = Math.ceil(TOTAL_WEEKS / WEEKS_PER_ROW); // ~77 rows

// Week states for cell coloring
export type WeekState = 'empty' | 'has-captures' | 'synthesized' | 'current' | 'future';

/**
 * Determine the visual state of a week cell.
 * Priority: current > synthesized > has-captures > future > empty
 */
export function getWeekState(
  weekNumber: number,
  currentWeekNumber: number,
  hasEntries: boolean,
  hasSynthesis: boolean
): WeekState {
  if (weekNumber === currentWeekNumber) return 'current';
  if (weekNumber > currentWeekNumber) return 'future';
  if (hasSynthesis) return 'synthesized';
  if (hasEntries) return 'has-captures';
  return 'empty';
}

/**
 * Get the approximate year label for a row in the grid.
 * Row 0 = the year containing Week 1.
 * Each row = 52 weeks ~ 1 year.
 */
export function getYearForRow(row: number, week1Year: number): number {
  return week1Year + row;
}

/**
 * Convert row and column to week number.
 * row=0, col=0 => Week 1
 */
export function rowColToWeekNumber(row: number, col: number): number {
  return row * WEEKS_PER_ROW + col + 1;
}

/**
 * Convert week number to row and column.
 */
export function weekNumberToRowCol(weekNumber: number): { row: number; col: number } {
  const index = weekNumber - 1;
  return {
    row: Math.floor(index / WEEKS_PER_ROW),
    col: index % WEEKS_PER_ROW,
  };
}

/**
 * Get the row that contains a given week number (for auto-scrolling).
 */
export function getRowForWeek(weekNumber: number): number {
  return Math.floor((weekNumber - 1) / WEEKS_PER_ROW);
}
