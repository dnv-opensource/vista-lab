import clsx from 'clsx';
import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import useOutsideClick from '../../../hooks/use-outside-click';
import ScrollableField from '../scrollable-field/ScrollableField';
import './Dropdown.scss';

interface Props {
  anchorRef: React.RefObject<HTMLElement>;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
  closeOnOutsideClick?: boolean;
  onOutsideClick?: () => void;
  fitAnchor?: boolean;
}

const Dropdown: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  anchorRef,
  open,
  setOpen,
  className,
  closeOnOutsideClick = true,
  onOutsideClick,
  fitAnchor = false,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  useOutsideClick([dropdownRef, anchorRef], undefined, () => {
    if (closeOnOutsideClick) setOpen(false);
    onOutsideClick && onOutsideClick();
  });
  if (!anchorRef.current) return <></>;

  const { left, top, width, height } = anchorRef.current.getBoundingClientRect() || {};

  return ReactDOM.createPortal(
    open && (
      <ScrollableField
        ref={dropdownRef}
        className={clsx('ui-dropdown', className)}
        style={{
          top: top + height,
          left: fitAnchor ? left ?? 0 : (left ?? 0) + (width ?? 0) / 2,
          width: fitAnchor ? width : undefined,
        }}
      >
        {children}
      </ScrollableField>
    ),
    document.body
  );
};

export default Dropdown;
