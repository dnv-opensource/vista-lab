export interface TimeOption {
  from: string;
  to: string;
  display: string;
}

export type InputState = {
  value: string;
  validation: RangeValidation;
};

export type RangeValidation = {
  isValid: boolean;
  errorMessage?: string;
};

export interface RelativeTimeRange {
  from: number;
  to: number;
  display?: string;
}
