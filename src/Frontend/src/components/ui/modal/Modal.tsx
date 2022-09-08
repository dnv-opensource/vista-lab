import clsx from 'clsx';
import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import useOutsideClick from '../../../hooks/use-outside-click';
import Icon from '../icons/Icon';
import { IconName } from '../icons/icons';
import './Modal.scss';

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
  attachEl?: HTMLElement;
  closeOnOutsideClick?: boolean;
  title?: JSX.Element | string;
}

const Modal: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  className,
  open,
  setOpen,
  attachEl = document.body,
  closeOnOutsideClick = true,
  title,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useOutsideClick(modalRef, undefined, () => {
    console.log('outside');

    closeOnOutsideClick && setOpen(false);
  });

  return open
    ? ReactDOM.createPortal(
        <div className={clsx('ui-modal', className)}>
          <div className={'ui-modal-content-wrapper'} ref={modalRef}>
            <div className={'ui-modal-header'}>
              <p className={'ui-modal-title'}>{title}</p>
              <Icon
                className={'ui-modal-exit-icon'}
                icon={IconName.XMark}
                onClick={() => {
                  console.log('asdasd');
                  setOpen(false);
                }}
              />
            </div>
            <div className={'ui-modal-content'}>{children}</div>
          </div>
        </div>,
        attachEl
      )
    : null;
};

export default Modal;
