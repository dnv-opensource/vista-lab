import clsx from 'clsx';
import React, { useCallback, useEffect, useState } from 'react';
import Icon from '../icons/Icon';
import { IconName } from '../icons/icons';
import './Input.scss';
type InputTypes = string | number | undefined;

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: IconName;
  value?: InputTypes;
}

const Input: React.FC<Props> = ({ icon, className, value: inputValue, onChange: onInputChange, ...restProps }) => {
  const [value, setValue] = useState<InputTypes>();

  useEffect(() => {
    setValue(inputValue);
  }, [inputValue]);

  const onChange = useCallback(
    (e: React.ChangeEvent<any>) => onInputChange?.(e) ?? setValue(e.target.value),
    [onInputChange, setValue]
  );

  return (
    <div className={clsx('ui-input', value === undefined && 'empty', className)}>
      {icon && <Icon icon={icon} className="input-icon" />}
      <input value={value ?? ''} onChange={onChange} {...restProps} />
      <Icon icon={IconName.Times} className={clsx('cancel-icon', value === undefined && 'empty')} onClick={onChange} />
    </div>
  );
};

export default Input;
