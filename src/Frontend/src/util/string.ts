export const isNullOrWhitespace = (s?: string) => {
  return s === undefined || s.trim() === '';
};

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
