import { InputTypes } from '../components/ui/input/Input';

export const isNullOrWhitespace = (s?: InputTypes) => {
  return s === undefined || (typeof s === 'string' && s.trim() === '');
};

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const nextChar = (c: string) => {
  return String.fromCharCode(c.charCodeAt(0) + 1);
};
