import clsx from 'clsx';
import React from 'react';
import './ScrollableField.scss';

const ScrollableField: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...restProps }) => {
  return (
    <div {...restProps} className={clsx('scrollable-field', className)}>
      {children}
    </div>
  );
};

export default ScrollableField;
