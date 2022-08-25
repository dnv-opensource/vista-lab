import React, { useEffect } from 'react';

const useOutsideClick = (
  ref: React.RefObject<HTMLElement> | React.RefObject<HTMLElement>[],
  wrapperElement: Node = document,
  onOutsideClick: () => void
) => {
  useEffect(() => {
    function handleClickOutside(event: Event) {
      const target = event.target as HTMLElement;
      if ('current' in ref) {
        if (ref.current && !ref.current.contains(target)) {
          onOutsideClick();
        }
      } else {
        const refs = ref as React.RefObject<HTMLElement>[];
        if (refs.every(ref => ref.current && !ref.current.contains(target))) {
          onOutsideClick();
        }
      }
    }
    wrapperElement.addEventListener('mousedown', handleClickOutside);
    return () => {
      wrapperElement.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, onOutsideClick, wrapperElement]);
};

export default useOutsideClick;
