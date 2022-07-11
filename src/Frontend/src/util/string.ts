export const isNullOrWhitespace = (s?: string) => {
  return s === undefined || s.trim() === '';
};
