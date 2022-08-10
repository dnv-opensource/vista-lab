import React, { ReactNode, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import './Tooltip.scss';

interface Props {
  content: ReactNode;
}

const Tooltip: React.FC<React.PropsWithChildren<Props>> = ({ children, content }) => {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState(false);

  const { left, top, width } = wrapperRef.current?.getBoundingClientRect() || {};

  return (
    <>
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
            <div className={'tooltip'} style={{ top, left: (left ?? 0) + (width ?? 0) / 2 }}>
              <div className={'tooltip__arrow'} />
              {content}
            </div>,
            document.body
          )}
        {children}
      </span>
    </>
  );
};

export default Tooltip;
