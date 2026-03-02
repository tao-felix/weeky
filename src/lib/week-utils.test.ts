import { describe, it, expect } from 'vitest';
import {
  getWeekNumber,
  getWeekBoundaries,
  getCurrentWeek,
  EPOCH_DATE,
  EPOCH_WEEK_NUMBER,
} from './week-utils';

describe('week-utils', () => {
  describe('constants', () => {
    it('EPOCH_WEEK_NUMBER is 943', () => {
      expect(EPOCH_WEEK_NUMBER).toBe(943);
    });

    it('EPOCH_DATE is 2025-07-20 (Sunday)', () => {
      expect(EPOCH_DATE.getFullYear()).toBe(2025);
      expect(EPOCH_DATE.getMonth()).toBe(6); // July is 0-indexed month 6
      expect(EPOCH_DATE.getDate()).toBe(20);
      // Sunday = day 0
      expect(EPOCH_DATE.getDay()).toBe(0);
    });
  });

  describe('getWeekNumber', () => {
    it('returns 943 for epoch date 2025-07-20 (Sunday)', () => {
      expect(getWeekNumber(new Date(2025, 6, 20))).toBe(943);
    });

    it('returns 943 for 2025-07-26 (Saturday, same week)', () => {
      expect(getWeekNumber(new Date(2025, 6, 26))).toBe(943);
    });

    it('returns 944 for 2025-07-27 (next Sunday, next week)', () => {
      expect(getWeekNumber(new Date(2025, 6, 27))).toBe(944);
    });

    it('returns 942 for 2025-07-13 (one week before epoch)', () => {
      expect(getWeekNumber(new Date(2025, 6, 13))).toBe(942);
    });

    it('returns 8 for 2007-08-19 (Sun Aug 19, 2007)', () => {
      // 2007-08-19 is 6545 days before epoch, which is 935 weeks -> week 943 - 935 = 8
      expect(getWeekNumber(new Date(2007, 7, 19))).toBe(8);
    });

    it('returns 1 for 2007-07-01 (week 1, 942 weeks before epoch)', () => {
      expect(getWeekNumber(new Date(2007, 6, 1))).toBe(1);
    });

    it('handles mid-week dates correctly', () => {
      // Wednesday 2025-07-23 should still be week 943
      expect(getWeekNumber(new Date(2025, 6, 23))).toBe(943);
    });

    it('handles dates far in the future', () => {
      // 10 weeks after epoch = week 953
      expect(getWeekNumber(new Date(2025, 8, 28))).toBe(953);
    });

    it('handles dates far in the past', () => {
      // Week 1 starts on 2007-07-01, so week 0 starts on 2007-06-24
      expect(getWeekNumber(new Date(2007, 5, 24))).toBe(0);
    });
  });

  describe('getWeekBoundaries', () => {
    it('returns correct boundaries for epoch week 943', () => {
      const boundaries = getWeekBoundaries(943);
      expect(boundaries.start).toBe('2025-07-20');
      expect(boundaries.end).toBe('2025-07-26');
    });

    it('returns correct boundaries for week 944', () => {
      const boundaries = getWeekBoundaries(944);
      expect(boundaries.start).toBe('2025-07-27');
      expect(boundaries.end).toBe('2025-08-02');
    });

    it('returns correct boundaries for week 1', () => {
      const boundaries = getWeekBoundaries(1);
      // 942 weeks before epoch: 2025-07-20 - (942 * 7 days) = 2007-07-01
      expect(boundaries.start).toBe('2007-07-01');
      expect(boundaries.end).toBe('2007-07-07');
    });

    it('start is always a Sunday', () => {
      for (const weekNum of [1, 100, 500, 943, 944, 1000]) {
        const boundaries = getWeekBoundaries(weekNum);
        const startDate = new Date(boundaries.start + 'T00:00:00');
        expect(startDate.getDay()).toBe(0); // Sunday
      }
    });

    it('end is always a Saturday', () => {
      for (const weekNum of [1, 100, 500, 943, 944, 1000]) {
        const boundaries = getWeekBoundaries(weekNum);
        const endDate = new Date(boundaries.end + 'T00:00:00');
        expect(endDate.getDay()).toBe(6); // Saturday
      }
    });

    it('span is always exactly 7 days', () => {
      for (const weekNum of [1, 500, 943, 1500]) {
        const boundaries = getWeekBoundaries(weekNum);
        const start = new Date(boundaries.start + 'T00:00:00');
        const end = new Date(boundaries.end + 'T00:00:00');
        const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        expect(diffDays).toBe(6); // Saturday - Sunday = 6 days
      }
    });
  });

  describe('getCurrentWeek', () => {
    it('returns a number >= 943 (today is after epoch)', () => {
      const current = getCurrentWeek();
      expect(current).toBeGreaterThanOrEqual(943);
    });

    it('returns a finite number', () => {
      expect(Number.isFinite(getCurrentWeek())).toBe(true);
    });
  });

  describe('round-trip consistency', () => {
    it('getWeekNumber(getWeekBoundaries(N).start) === N', () => {
      for (const weekNum of [1, 100, 500, 942, 943, 944, 1000, 1500]) {
        const boundaries = getWeekBoundaries(weekNum);
        const computed = getWeekNumber(new Date(boundaries.start + 'T00:00:00'));
        expect(computed).toBe(weekNum);
      }
    });

    it('getWeekNumber(getWeekBoundaries(N).end) === N', () => {
      for (const weekNum of [1, 100, 500, 942, 943, 944, 1000, 1500]) {
        const boundaries = getWeekBoundaries(weekNum);
        const computed = getWeekNumber(new Date(boundaries.end + 'T00:00:00'));
        expect(computed).toBe(weekNum);
      }
    });
  });

  describe('week number increment/decrement', () => {
    it('week numbers increment by 1 for every 7 days forward', () => {
      const base = new Date(2025, 6, 20); // Week 943 (local midnight)
      for (let i = 0; i < 10; i++) {
        const date = new Date(base);
        date.setDate(date.getDate() + i * 7);
        expect(getWeekNumber(date)).toBe(943 + i);
      }
    });

    it('week numbers decrement by 1 for every 7 days backward', () => {
      const base = new Date(2025, 6, 20); // Week 943 (local midnight)
      for (let i = 0; i < 10; i++) {
        const date = new Date(base);
        date.setDate(date.getDate() - i * 7);
        expect(getWeekNumber(date)).toBe(943 - i);
      }
    });
  });
});
