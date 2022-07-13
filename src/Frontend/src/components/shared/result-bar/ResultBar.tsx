import clsx from 'clsx';
import React from 'react';
import './ResultBar.scss';

interface Props {
  className?: string;
}

const ResultBar: React.FC<React.PropsWithChildren<Props>> = ({ className, children }) => {
  return <div className={clsx('result-bar', className)}>{children}</div>;
};

export default ResultBar;
