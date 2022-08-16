import clsx from 'clsx';
import React, { ReactNode, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import './Tooltip.scss';

interface Props {
  /**@param content Make sure to not scope the scss code inside a parent other the then @param className as it will be appended to the body */
  content: ReactNode;
  /**@param className Tooltip classname. Make sure to not scope the scss code inside a parent as it will be appended to the body */
  className?: string;
}

const Tooltip: React.FC<React.PropsWithChildren<Props>> = ({ children, content, className }) => {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState(false);

  const { left, top, width } = wrapperRef.current?.getBoundingClientRect() || {};

  return (
    <span
      ref={wrapperRef}
      className={'tooltip-wrapper'}
      onMouseOver={() => {
        setHovered(true);
      }}
      onMouseOut={() => {
        setHovered(false);
      }}
    >
      {hovered &&
        ReactDOM.createPortal(
          <div className={clsx('tooltip', className)} style={{ top, left: (left ?? 0) + (width ?? 0) / 2 }}>
            <div className={'tooltip__arrow'} />
            {content}
          </div>,
          document.body
        )}
      {children}
    </span>
  );
};

export default Tooltip;
