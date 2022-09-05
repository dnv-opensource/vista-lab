import clsx from 'clsx';
import React from 'react';
import './ScrollableField.scss';

export interface ScrollProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.RefObject<HTMLDivElement>;
}

const ScrollableField: React.FC<ScrollProps> = React.forwardRef(({ children, className, ...restProps }, ref) => {
  return (
    <div ref={ref} {...restProps} className={clsx('scrollable-field', className)}>
      {children}
    </div>
  );
});

export default ScrollableField;
