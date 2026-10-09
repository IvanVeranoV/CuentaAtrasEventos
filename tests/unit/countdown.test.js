import { describe, expect, it } from 'vitest';
import { getBusinessCountdownParts, getCountdownParts } from '../../src/utils/countdown';

const localDate = (year, month, day, hour = 0) =>
  new Date(year, month - 1, day, hour);

describe('getBusinessCountdownParts', () => {
  it('excludes Saturday and Sunday from the remaining time', () => {
    const now = localDate(2024, 1, 5, 12);
    const targetDate = localDate(2024, 1, 8, 12);

    expect(getBusinessCountdownParts(targetDate, now)).toEqual({
      isPast: false,
      days: 1,
      hours: 0,
      minutes: 0,
      seconds: 0
    });
  });

  it('returns zero when the whole interval falls during the weekend', () => {
    const now = localDate(2024, 1, 6, 12);
    const targetDate = localDate(2024, 1, 7, 12);

    expect(getBusinessCountdownParts(targetDate, now)).toEqual({
      isPast: false,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    });
  });

  describe('getCountdownParts', () => {
    it('splits the time remaining into days, hours, minutes, and seconds', () => {
      const now = localDate(2024, 1, 1);
      const targetDate = new Date(now.getTime() + 2 * 86_400_000 + 3_723_000);

      expect(getCountdownParts(targetDate, now.getTime())).toEqual({
        isPast: false,
        days: 2,
        hours: 1,
        minutes: 2,
        seconds: 3
      });
    });

    it('marks past events and reports the absolute elapsed time', () => {
      const now = localDate(2024, 1, 2);
      const targetDate = new Date(now.getTime() - 90_000);

      expect(getCountdownParts(targetDate, now.getTime())).toEqual({
        isPast: true,
        days: 0,
        hours: 0,
        minutes: 1,
        seconds: 30
      });
    });
  });

  it('keeps track of time elapsed for past events while excluding weekends', () => {
    const now = localDate(2024, 1, 8, 12);
    const targetDate = localDate(2024, 1, 5, 12);

    expect(getBusinessCountdownParts(targetDate, now)).toEqual({
      isPast: true,
      days: 1,
      hours: 0,
      minutes: 0,
      seconds: 0
    });
  });
});
