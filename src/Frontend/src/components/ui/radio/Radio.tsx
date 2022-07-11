import clsx from 'clsx';
import React from 'react';
import './Radio.scss';

interface Props {
  checked?: boolean;
}

const Radio: React.FC<Props> = ({ checked }) => {
  return <div className={clsx('ui-radio', checked && 'checked')}>{checked && <div className={clsx('inner')} />}</div>;
};

export default Radio;
