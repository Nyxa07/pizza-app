const WEEKDAY_KEYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

const EVENING_HOUR = 18;

/**
 * Relative-day i18n key for a moment seen from `now` (`today`, `tonight`,
 * `tomorrow`, `inTwoDays`, then weekday names). Keys live under
 * `common.time.relativeDay.*`.
 */
export function relativeDayKey(date: Date, now: Date): string {
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayInMs = 24 * 60 * 60 * 1000;
  const days = Math.round(
    (startOfDay(date).getTime() - startOfDay(now).getTime()) / dayInMs,
  );

  switch (days) {
    case 0:
      return date.getHours() >= EVENING_HOUR ? 'tonight' : 'today';
    case 1:
      return 'tomorrow';
    case 2:
      return 'inTwoDays';
    default:
      return WEEKDAY_KEYS[date.getDay()];
  }
}
