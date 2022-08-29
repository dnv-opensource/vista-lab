import React, { useCallback, useEffect, useMemo, useState } from 'react';

export type LocalStorageSerializer<T> = {
  serialize: (state: T) => string;
  deserialize: (str: string) => T;
};

// Hook
const useLocalStorage = <T>(
  key: string,
  initialValue: T,
  /**@param Serializer Defaults to JSON serializers */
  serializer?: LocalStorageSerializer<T>
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  const defaultSerializer: LocalStorageSerializer<T> = useMemo(
    () => ({
      deserialize: str => JSON.parse(str),
      serialize: state => JSON.stringify(state),
    }),
    []
  );

  const memoizedSerializer = useMemo(() => serializer ?? defaultSerializer, [serializer, defaultSerializer]);

  // Re-init triggers
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      if (!item) return;
      // Parse stored json or if none return initialValue
      setStoredValue(memoizedSerializer.deserialize(item));
    } catch (error) {
      // If error also return initialValue
      console.log(error);
    }
  }, [key, setStoredValue, memoizedSerializer]);

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue: React.Dispatch<React.SetStateAction<T>> = useCallback(
    (value: T | ((prevState: T) => T)) => {
      try {
        setStoredValue(prev => {
          const valueToStore = value instanceof Function ? value(prev) : value;
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, memoizedSerializer.serialize(valueToStore));
          }
          return valueToStore;
        });
        // Allow value to be a function so we have same API as useState
        // Save state
        // Save to local storage
      } catch (error) {
        // A more advanced implementation would handle the error case
        console.log(error);
      }
    },
    [setStoredValue, key, memoizedSerializer]
  );
  return [storedValue, setValue];
};

export default useLocalStorage;
