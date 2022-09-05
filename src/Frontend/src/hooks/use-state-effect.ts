import React, { useCallback, useEffect, useState } from 'react';

export const useStateEffect = <T = undefined>(
  value: T | (() => T),
  onChange?: React.Dispatch<React.SetStateAction<T>>
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(value);

  const currentSetState: React.Dispatch<React.SetStateAction<T>> = useCallback(
    state => (onChange ? onChange(state) : setState(state)),
    [onChange, setState]
  );

  useEffect(() => {
    setState(value);
  }, [value, setState]);

  return [state, currentSetState];
};
