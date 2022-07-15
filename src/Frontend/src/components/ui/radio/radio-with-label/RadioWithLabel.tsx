import clsx from 'clsx';
import React from 'react';
import Radio, { RadioProps } from '../radio/Radio';
import './RadioWithLabel.scss';

interface Props extends Omit<RadioProps, 'id'> {
  label: string;
  className?: string;
}

const RadioWithLabel: React.FC<Props> = ({ className, label, onClick, ...restProps }) => {
  return (
    <div className={clsx('radio-with-label', className)} onClick={() => onClick?.(true)} tabIndex={-1}>
      <Radio id={label} {...restProps} />
      <label htmlFor={label} className={'label'}>
        {label}
      </label>
    </div>
  );
};

export default RadioWithLabel;
