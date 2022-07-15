import clsx from 'clsx';
import React, { useCallback, useEffect, useState } from 'react';
import RadioWithLabel from '../radio-with-label/RadioWithLabel';
import './RadioSelection.scss';

type RadioOption = { index: number; label: string };

interface Props {
  className?: string;
  options: RadioOption[];
  onChange?: (option: RadioOption) => void;
  selectedOption?: RadioOption;
}

const RadioSelection: React.FC<Props> = ({
  className,
  options,
  onChange,
  selectedOption: controlledSelectedOption,
}) => {
  const [selectedOption, setSelectedOption] = useState<RadioOption | undefined>(controlledSelectedOption);

  useEffect(() => {
    setSelectedOption(controlledSelectedOption);
  }, [controlledSelectedOption]);

  const handleChange = useCallback(
    (option: RadioOption) => onChange?.(option) ?? setSelectedOption(option),
    [setSelectedOption, onChange]
  );

  return (
    <div className={clsx('radio-selection', className)} tabIndex={-1}>
      {options.map((option, index) => (
        <RadioWithLabel
          key={option.label}
          label={option.label}
          checked={selectedOption ? option.index === selectedOption.index : index === 0}
          onClick={() => handleChange(option)}
        />
      ))}
    </div>
  );
};

export default RadioSelection;
