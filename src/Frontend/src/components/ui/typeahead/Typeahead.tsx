import clsx from 'clsx';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isNullOrWhitespace } from '../../../util/string';
import Dropdown from '../dropdown/Dropdown';
import Input, { InputProps, InputTypes } from '../input/Input';
import './Typeahead.scss';

export type TypeaheadOption<T> = {
  value: InputTypes;
  name?: string;
  option: T;
};

export interface TypeaheadProps<T> extends InputProps {
  options: T[];
  formatter: (option: T) => TypeaheadOption<T>;
  onSelectedOption: (option: T) => void;
  optionsClassName?: string;
}

const Typeahead = <T,>({
  value: inputValue,
  options,
  formatter,
  onSelectedOption,
  onChange,
  className,
  optionsClassName,
  ...inputProps
}: TypeaheadProps<T>) => {
  const inputRef = useRef<HTMLDivElement>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [value, setInputValue] = useState<InputTypes>('');

  const onValueChange = useCallback(
    (e?: React.ChangeEvent<HTMLInputElement>) => {
      onChange ? onChange(e) : setInputValue(e?.currentTarget.value || '');
    },
    [onChange, setInputValue]
  );

  const onOptionSelection = useCallback(
    (option: T) => {
      setShowOptions(false);
      onSelectedOption(option);
    },
    [onSelectedOption]
  );

  useEffect(() => {
    if (inputValue) setInputValue(inputValue);
  }, [inputValue, setInputValue]);

  const formattedOptions = useMemo(() => options.map(formatter), [options, formatter]);

  const filteredOptions = useMemo(() => {
    if (isNullOrWhitespace(value)) {
      return formattedOptions;
    }

    return formattedOptions.filter(
      o => !!o.value?.toString().toLocaleLowerCase().includes(value!.toString().toLocaleLowerCase())
    );
  }, [formattedOptions, value]);

  const showNames = useMemo(() => formattedOptions.some(o => o.name !== undefined), [formattedOptions]);

  return (
    <>
      <Input
        {...inputProps}
        className={clsx('ui-typeahead-input', className)}
        value={value}
        onFocus={() => setShowOptions(true)}
        onChange={onValueChange}
        ref={inputRef}
      />
      {inputRef.current && (
        <Dropdown
          className={clsx('ui-typeahead-options', optionsClassName)}
          anchorRef={inputRef}
          open={showOptions}
          setOpen={setShowOptions}
          onOutsideClick={() => {
            setInputValue(inputValue);
          }}
          fitAnchor
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map(o => (
              <div key={o.value} className={'ui-typeahead-option'} onClick={() => onOptionSelection(o.option)}>
                {showNames && <p className={'ui-typeahead-name'}>{o.name}</p>}
                <p className={'ui-typeahead-value'}>{o.value}</p>
              </div>
            ))
          ) : (
            <p className={'no-options-available'}>No available options</p>
          )}
        </Dropdown>
      )}
    </>
  );
};

export default Typeahead;
