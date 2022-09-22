export const assertTrue = <T>(value: T | undefined): value is T => {
  return value !== undefined;
};
