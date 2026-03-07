import { startOfWeek, addDays, differenceInCalendarDays, format } from 'date-fns';

// Epoch: Week 943 starts on Sunday, 2025-07-20
export const EPOCH_DATE = new Date('2025-07-20T00:00:00');
export const EPOCH_WEEK_NUMBER = 943;

/**
 * Get the week number for a given date.
 * Week runs Sunday to Saturday.
 * Founder's epoch: 2025-07-20 = Week 943.
 */
export function getWeekNumber(date: Date): number {
  const sunday = startOfWeek(date, { weekStartsOn: 0 }); // 0 = Sunday
  const daysDiff = differenceInCalendarDays(sunday, EPOCH_DATE);
  return EPOCH_WEEK_NUMBER + Math.floor(daysDiff / 7);
}

/**
 * Get the start (Sunday) and end (Saturday) dates for a given week number.
 */
export function getWeekBoundaries(weekNumber: number): { start: string; end: string } {
  const weeksDiff = weekNumber - EPOCH_WEEK_NUMBER;
  const sunday = addDays(EPOCH_DATE, weeksDiff * 7);
  const saturday = addDays(sunday, 6);
  return {
    start: format(sunday, 'yyyy-MM-dd'),
    end: format(saturday, 'yyyy-MM-dd'),
  };
}

/**
 * Get the current week number based on today's date.
 */
export function getCurrentWeek(): number {
  return getWeekNumber(new Date());
}

/**
 * Calculate how many weeks a person has lived since their birth date.
 */
export function getWeeksLived(birthDate: Date): number {
  return Math.floor(differenceInCalendarDays(new Date(), birthDate) / 7);
}
