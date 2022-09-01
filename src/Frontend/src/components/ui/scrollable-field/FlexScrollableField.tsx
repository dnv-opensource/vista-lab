import clsx from 'clsx';
import React from 'react';
import { ScrollProps } from './ScrollableField';
import './ScrollableField.scss';

/**@description Use this if you want to scroll in a flexable field. Make sure container has display: grid or flex */
const FlexScrollableField: React.FC<ScrollProps> = React.forwardRef(({ children, className, ...rest }, ref) => {
  return (
    <div ref={ref} className={'relative-scroll-container'}>
      <div {...rest} className={clsx('flex-scrollable-field', className)}>
        {children}
      </div>
    </div>
  );
});

export default FlexScrollableField;
