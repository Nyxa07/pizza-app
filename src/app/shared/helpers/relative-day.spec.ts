import { relativeDayKey } from './relative-day';

describe('relativeDayKey', () => {
  // A Tuesday afternoon.
  const now = new Date(2026, 6, 14, 14, 30);

  it('says today for a moment later the same afternoon', () => {
    expect(relativeDayKey(new Date(2026, 6, 14, 16, 0), now)).toBe('today');
  });

  it('says tonight for the same calendar day from 18:00', () => {
    expect(relativeDayKey(new Date(2026, 6, 14, 18, 0), now)).toBe('tonight');
    expect(relativeDayKey(new Date(2026, 6, 14, 21, 0), now)).toBe('tonight');
  });

  it('says tomorrow on the next calendar day, even minutes after midnight', () => {
    const lateNow = new Date(2026, 6, 14, 23, 50);
    expect(relativeDayKey(new Date(2026, 6, 15, 0, 30), lateNow)).toBe(
      'tomorrow',
    );
    expect(relativeDayKey(new Date(2026, 6, 15, 9, 0), now)).toBe('tomorrow');
  });

  it('says in two days on the day after tomorrow', () => {
    expect(relativeDayKey(new Date(2026, 6, 16, 9, 0), now)).toBe('inTwoDays');
  });

  it('falls back to the weekday name beyond two days', () => {
    // 2026-07-17 is a Friday.
    expect(relativeDayKey(new Date(2026, 6, 17, 9, 0), now)).toBe('friday');
    // 2026-07-19 is a Sunday.
    expect(relativeDayKey(new Date(2026, 6, 19, 9, 0), now)).toBe('sunday');
  });
});
