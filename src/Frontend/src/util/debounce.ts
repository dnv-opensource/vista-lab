/* eslint-disable @typescript-eslint/no-explicit-any */
const debounce = <T extends (...args: any[]) => any>(callback: T, delay = 100) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>): ReturnType<T> => {
    let result: any;
    timeout && clearTimeout(timeout);
    timeout = setTimeout(() => {
      result = callback(...args);
    }, delay);
    return result;
  };
};

export default debounce;
