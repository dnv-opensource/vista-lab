import { useState, useCallback } from 'react';
import __ from 'lodash';

/**
 *
 * With some modifications
 *
 * https://github.com/craig1123/react-recipes/blob/95157a1e1b7789b3b537118f42f1e782a03df18a/src/useArray.js
 */

type UseArrayFunctions<T> = {
  add: (a: T) => void;
  addOrRemove: (a: T) => void;
  clear: () => void;
  removeByValue: (v: T) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  removeById: (id: any) => void;
  insertByIndex: (index: number, v: T) => void;
  replaceByIndex: (index: number, v: T) => void;
  removeIndex: (index: number) => void;
};
type UseArray<T> = [T[], React.Dispatch<React.SetStateAction<T[]>>, UseArrayFunctions<T>];

const useArray = <T>(initial: T[]): UseArray<T> => {
  const [value, setValue] = useState(initial);

  return [
    value,
    setValue,
    {
      add: useCallback((a: T) => setValue(v => [...v, a]), []),
      addOrRemove: useCallback(
        (a: T) =>
          setValue(arr => {
            if (arr.includes(a)) {
              return arr.filter((_, i) => i !== arr.findIndex((val: T) => __.isEqual(val, a)));
            } else {
              return [...arr, a];
            }
          }),
        []
      ),
      clear: useCallback(() => setValue(() => []), []),
      removeByValue: useCallback((v: T) => {
        setValue(arr => arr.filter((_, i) => i !== arr.findIndex((val: T) => __.isEqual(val, v))));
      }, []),
      removeById: useCallback(
        id =>
          setValue(arr =>
            arr.filter(v => {
              if (typeof v === 'object' && 'id' in v) {
                const val = v as T & { id?: string };
                return val.id === id;
              }
              return v && v !== id;
            })
          ),
        []
      ),
      insertByIndex: useCallback(
        (index: number, v: T) =>
          setValue(arr => {
            const prevArr = [...arr];
            prevArr.splice(index, 0, v);
            return prevArr;
          }),
        []
      ),
      replaceByIndex: useCallback(
        (index: number, v: T) =>
          setValue(arr => {
            const prevArr = [...arr];
            prevArr.splice(index, 1, v);
            return prevArr;
          }),
        []
      ),
      removeIndex: useCallback((index: number) => setValue(arr => arr.filter((_, i) => i !== index)), []),
    },
  ];
};

export default useArray;
