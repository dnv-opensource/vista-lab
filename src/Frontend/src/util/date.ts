export const getMaxMinDates = (dates: Date[]): [Date, Date] => {
  const numDates = dates.map(Number);
  return [new Date(Math.min(...numDates)), new Date(Math.max(...numDates))];
};

export const removeDuplicateDates = (dates: Date[]): Date[] => {
  return dates
    .map(date => {
      return date.getTime();
    })
    .filter((date, i, array) => {
      return array.indexOf(date) === i;
    })
    .map(time => {
      return new Date(time);
    });
};

export const toLocaleTimeRangeString = (date: Date, range: { from: number; to: number }, locale: string = 'en-US') => {
  const timeRangeInSeconds = Math.abs(range.to - range.from);

  switch (true) {
    case timeRangeInSeconds <= units.h:
      return date.toLocaleTimeString(locale);

    case timeRangeInSeconds <= units.d:
      return date.getHours() + ':00';
  }

  return date.toLocaleDateString();
};

export const units: Record<string, number> = {
  y: 31556926,
  w: 604800,
  d: 86400,
  h: 3600,
  m: 60,
  s: 1,
};
