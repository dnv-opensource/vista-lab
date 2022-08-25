import clsx from 'clsx';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from '../icons/Icon';
import { IconName } from '../icons/icons';
import Loader from '../loader/Loader';
import './Input.scss';

export type InputTypes = string | number | undefined;

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: IconName;
  value?: InputTypes;
  loadingResult?: boolean;
  onChange?: (e?: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input = React.forwardRef<HTMLDivElement, InputProps>(
  ({ icon, className, value: inputValue, onChange: onInputChange, loadingResult = false, ...restProps }, ref) => {
    const [value, setValue] = useState<InputTypes>();

    useEffect(() => {
      setValue(inputValue);
    }, [inputValue]);

    const onChange = useCallback(
      (e?: React.ChangeEvent<any>) => {
        if (!e) {
          onInputChange?.(e) ?? setValue(undefined);

          return;
        }
        onInputChange?.(e) ?? setValue(e.target.value);
      },
      [onInputChange, setValue]
    );

    const isEmpty = useMemo(() => value === undefined || (typeof value === 'string' && value.length === 0), [value]);

    return (
      <div className={clsx('ui-input', isEmpty && 'empty', className)} ref={ref}>
        {icon && <Icon icon={icon} className="input-icon" />}
        <input value={value ?? ''} onChange={onChange} {...restProps} />
        {!loadingResult ? (
          <Icon
            icon={IconName.Times}
            className={clsx('cancel-icon', isEmpty && 'empty')}
            onClick={() => onChange(undefined)}
          />
        ) : (
          <Loader />
        )}
      </div>
    );
  }
);

export default Input;
