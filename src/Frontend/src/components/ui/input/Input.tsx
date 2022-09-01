import clsx from 'clsx';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../icons/Icon';
import { IconName } from '../icons/icons';
import Loader from '../loader/Loader';
import './Input.scss';

export type InputTypes = string | number | undefined;

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: IconName;
  iconLast?: boolean;
  value?: InputTypes;
  loadingResult?: boolean;
  onChange?: (e?: React.ChangeEvent<HTMLInputElement>) => void;
  hideClearIcon?: boolean;
}

const Input = React.forwardRef<HTMLDivElement, InputProps>(
  (
    {
      icon,
      className,
      value: inputValue,
      onChange: onInputChange,
      loadingResult = false,
      iconLast,
      hideClearIcon = false,
      ...restProps
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
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

    const iconComp = icon && <Icon icon={icon} className="input-icon" />;

    return (
      <>
        <div
          id="ui-input"
          className={clsx('ui-input', isEmpty && 'empty', className)}
          ref={ref}
          onClick={() => {
            inputRef?.current?.focus();
          }}
        >
          {!iconLast && iconComp}
          <input {...restProps} ref={inputRef} value={value ?? ''} onChange={onChange} />
          {!loadingResult ? (
            !hideClearIcon && (
              <Icon
                icon={IconName.Times}
                className={clsx('cancel-icon', isEmpty && 'empty')}
                onClick={() => onChange(undefined)}
              />
            )
          ) : (
            <Loader />
          )}
          {iconLast && iconComp}
        </div>
      </>
    );
  }
);

export default Input;
