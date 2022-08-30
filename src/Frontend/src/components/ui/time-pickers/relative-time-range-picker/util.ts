import { RangeValidation, RelativeTimeRange, TimeOption } from './types';

// eslint-disable-next-line
const regex = /^now$|^now\-(\d{1,10})([wdhms])$/;

export const mapOptionToRelativeTimeRange = (option: TimeOption): RelativeTimeRange | undefined => {
  return {
    from: relativeToSeconds(option.from),
    to: relativeToSeconds(option.to),
    display: option.display,
  };
};

export const mapRelativeTimeRangeToOption = (range: RelativeTimeRange): TimeOption => {
  const from = secondsToRelativeFormat(range.from);
  const to = secondsToRelativeFormat(range.to);
  const display = quickOptions.find(o => o.from.toString() === from && o.to.toString() === to)?.display;

  return {
    from,
    to,
    display: display ?? `${from} to ${to}`,
  };
};

export const isRangeValid = (relative: string, now = Date.now()): RangeValidation => {
  if (!isRelativeFormat(relative)) {
    return {
      isValid: false,
      errorMessage: 'Value not in relative time format.',
    };
  }

  const seconds = relativeToSeconds(relative);

  if (seconds > Math.ceil(now / 1000)) {
    return {
      isValid: false,
      errorMessage: 'Can not enter value prior to January 1, 1970.',
    };
  }

  return { isValid: true };
};

export const isRelativeFormat = (format: string): boolean => {
  return regex.test(format);
};

const relativeToSeconds = (relative: string): number => {
  const match = regex.exec(relative);

  if (!match || match.length !== 3) {
    return 0;
  }

  const [, value, unit] = match;
  const parsed = parseInt(value, 10);

  if (isNaN(parsed)) {
    return 0;
  }

  return parsed * units[unit];
};

const units: Record<string, number> = {
  w: 604800,
  d: 86400,
  h: 3600,
  m: 60,
  s: 1,
};

const secondsToRelativeFormat = (seconds: number): string => {
  if (seconds <= 0) {
    return 'now';
  }

  if (seconds >= units.w && seconds % units.w === 0) {
    return `now-${seconds / units.w}w`;
  }

  if (seconds >= units.d && seconds % units.d === 0) {
    return `now-${seconds / units.d}d`;
  }

  if (seconds >= units.h && seconds % units.h === 0) {
    return `now-${seconds / units.h}h`;
  }

  if (seconds >= units.m && seconds % units.m === 0) {
    return `now-${seconds / units.m}m`;
  }

  return `now-${seconds}s`;
};

export function keyForOption(option: TimeOption, index: number): string {
  return `${option.from}-${option.to}-${index}`;
}

export function isEqual(x: RelativeTimeRange, y?: RelativeTimeRange): boolean {
  if (!y || !x) {
    return false;
  }
  return y.from === x.from && y.to === x.to;
}

export const quickOptions: TimeOption[] = [
  { from: 'now-5m', to: 'now', display: 'Last 5 minutes' },
  { from: 'now-15m', to: 'now', display: 'Last 15 minutes' },
  { from: 'now-30m', to: 'now', display: 'Last 30 minutes' },
  { from: 'now-1h', to: 'now', display: 'Last 1 hour' },
  { from: 'now-3h', to: 'now', display: 'Last 3 hours' },
  { from: 'now-6h', to: 'now', display: 'Last 6 hours' },
  { from: 'now-12h', to: 'now', display: 'Last 12 hours' },
  { from: 'now-24h', to: 'now', display: 'Last 24 hours' },
  { from: 'now-2d', to: 'now', display: 'Last 2 days' },
  { from: 'now-7d', to: 'now', display: 'Last 7 days' },
  { from: 'now-30d', to: 'now', display: 'Last 30 days' },
  { from: 'now-90d', to: 'now', display: 'Last 90 days' },
  { from: 'now-6M', to: 'now', display: 'Last 6 months' },
  { from: 'now-1y', to: 'now', display: 'Last 1 year' },
  { from: 'now-2y', to: 'now', display: 'Last 2 years' },
  { from: 'now-5y', to: 'now', display: 'Last 5 years' },
  { from: 'now-1d/d', to: 'now-1d/d', display: 'Yesterday' },
  { from: 'now-2d/d', to: 'now-2d/d', display: 'Day before yesterday' },
  { from: 'now-7d/d', to: 'now-7d/d', display: 'This day last week' },
  { from: 'now-1w/w', to: 'now-1w/w', display: 'Previous week' },
  { from: 'now-1M/M', to: 'now-1M/M', display: 'Previous month' },
  { from: 'now-1Q/fQ', to: 'now-1Q/fQ', display: 'Previous fiscal quarter' },
  { from: 'now-1y/y', to: 'now-1y/y', display: 'Previous year' },
  { from: 'now-1y/fy', to: 'now-1y/fy', display: 'Previous fiscal year' },
  { from: 'now/d', to: 'now/d', display: 'Today' },
  { from: 'now/d', to: 'now', display: 'Today so far' },
  { from: 'now/w', to: 'now/w', display: 'This week' },
  { from: 'now/w', to: 'now', display: 'This week so far' },
  { from: 'now/M', to: 'now/M', display: 'This month' },
  { from: 'now/M', to: 'now', display: 'This month so far' },
  { from: 'now/y', to: 'now/y', display: 'This year' },
  { from: 'now/y', to: 'now', display: 'This year so far' },
  { from: 'now/fQ', to: 'now', display: 'This fiscal quarter so far' },
  { from: 'now/fQ', to: 'now/fQ', display: 'This fiscal quarter' },
  { from: 'now/fy', to: 'now', display: 'This fiscal year so far' },
  { from: 'now/fy', to: 'now/fy', display: 'This fiscal year' },
];
