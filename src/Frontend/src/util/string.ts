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

export const toFormattedNumberString = (value?: number) => {
  if (!value) return '';

  const intString = Math.floor(value).toString();

  switch (true) {
    case intString.length <= 4:
      return value.toFixed(2);
    case intString.length < 7:
      return intString.slice(0, intString.length - 3) + 'k';
    case intString.length < 10:
      return intString.slice(0, intString.length - 6) + 'M';
    default:
      return intString.slice(0, intString.length - 9) + 'B';
  }
};
