import clsx from 'clsx';
import React from 'react';
import { useStateEffect } from '../../../hooks/use-state-effect';
import './Checkbox.scss';

interface Props {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
  label?: string;
}

const Checkbox: React.FC<Props> = ({ checked = false, onChange, className, label }) => {
  const [state, setState] = useStateEffect(checked, onChange ? val => onChange(val as boolean) : undefined);
  return (
    <label className={clsx('ui-checkbox', className)}>
      <span className={'checkbox-label'}>{label}</span>
      <input type={'checkbox'} checked={state} onChange={e => setState(e.currentTarget.checked)} />
      <span className={'checkbox'} />
    </label>
  );
};

export default Checkbox;
