import { useState, useRef, useEffect, useCallback } from 'react';

/* https://ysfaran.github.io/blog/post/0002-use-state-with-promise/ */

export type Setter<T> = React.Dispatch<React.SetStateAction<T>>;

const useStateWithPromise = <T>(initialState: T | (() => T) = undefined as any): [T, (state: T) => Promise<T>] => {
  const [state, setState] = useState<T>(initialState);
  const resolverRef = useRef<any>(null);

  useEffect(() => {
    if (resolverRef.current !== null && state !== undefined) {
      resolverRef.current(state);
      resolverRef.current = null;
    }
    /**
     * Since a state update could be triggered with the exact same state again,
     * it's not enough to specify state as the only dependency of this useEffect.
     * That's why resolverRef.current is also a dependency, because it will guarantee,
     * that handleSetState was called in previous render
     */
  }, [resolverRef, state]);

  const handleSetState = useCallback(
    (stateAction: T): Promise<T> => {
      setState(stateAction);
      return new Promise(resolve => {
        resolverRef.current = resolve;
      });
    },
    [setState]
  );

  return [state, handleSetState];
};

export default useStateWithPromise;
