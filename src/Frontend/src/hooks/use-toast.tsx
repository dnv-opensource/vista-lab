import React, { useCallback, useRef } from 'react';
import { renderToString } from 'react-dom/server';

export enum ToastType {
  Success = 'success',
  Warning = 'warning',
  Danger = 'danger',
}

const useToast = () => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const addToast = useCallback((type: ToastType, title: string, children: JSX.Element, onClick?: { (): void }) => {
    const DURATION = 3000;
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
    if (onClick) el.onclick = onClick;

    anchor!.appendChild(el);

    const tryRemoveToast = () => {
      setTimeout(() => {
        if (el && el.matches(':hover')) {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          tryRemoveToast();
          return;
        }
        anchor!.removeChild(el);
      }, DURATION);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        document.body.removeChild(anchor!);
      }, DURATION);
    };

    tryRemoveToast();
  }, []);

  return { addToast };
};

export default useToast;
