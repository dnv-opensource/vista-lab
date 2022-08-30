import React, { useState } from 'react';

interface Props<T> {
  initialState: T;
  children: (value: T, state: React.Dispatch<React.SetStateAction<T>>) => JSX.Element;
}

const UseState = <T,>({ initialState, children }: Props<T>) => {
  const [value, setValue] = useState(initialState);
  return <>{children(value, setValue)}</>;
};

export default UseState;
