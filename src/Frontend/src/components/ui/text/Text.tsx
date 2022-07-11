import clsx from 'clsx';
import React from 'react';
import './Text.scss';

const Text: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className, ...restProps }) => {
  return (
    <p {...restProps} className={clsx('ui-text', className)}>
      {children}
    </p>
  );
};

export default Text;
