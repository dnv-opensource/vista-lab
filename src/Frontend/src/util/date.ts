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
