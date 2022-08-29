import React, { useCallback, useRef } from 'react';
import { renderToString } from 'react-dom/server';

export enum ToastType {
  Success = 'success',
  Warning = 'warning',
  Danger = 'danger',
}

const useToast = () => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const addToast = useCallback((type: ToastType, title: string, children: JSX.Element) => {
    const DURATION = 2000;
    const toastId = 'vista-toast-anchor';
    let anchor = document.getElementById(toastId);

    if (!anchor) {
      anchor = document.createElement('div');
      anchor.id = toastId;
      anchor.className = 'vista-toast-anchor';

      document.body.appendChild(anchor);
    }

    const el = document.createElement('div');
    el.className = 'vista-toast ' + type;

    const jsx = (
      <>
        <div className={'toast-title'}>{title}</div>
        <div className={'toast-content'}>{children}</div>
      </>
    );

    el.innerHTML = renderToString(jsx);

    anchor!.appendChild(el);

    setTimeout(() => {
      anchor!.removeChild(el);
    }, DURATION);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      document.body.removeChild(anchor!);
    }, DURATION);
  }, []);

  return { addToast };
};

export default useToast;
