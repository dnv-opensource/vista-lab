import React, { useCallback } from 'react';
import { IconName } from '../../../ui/icons/icons';
import Typeahead, { TypeaheadOption } from '../../../ui/typeahead/Typeahead';
import './OperatorSelection.scss';

export enum Operator {
  Sum = '+',
  Subtract = '-',
  Times = 'x',
  Divide = '/',
  Average = 'avg',
}
const OPERATOR_OPTIONS = Object.values(Operator) as Operator[];

interface Props {
  className?: string;
  onSelect: (operator: Operator) => void;
  operator: Operator | undefined;
}

const OperatorSelection: React.FC<Props> = ({ className, onSelect, operator }) => {
  const format = useCallback((option: Operator): TypeaheadOption<Operator> => {
    return { option, value: option };
  }, []);

  return (
    <Typeahead
      value={operator}
      icon={IconName.AngleDown}
      options={OPERATOR_OPTIONS}
      formatter={format}
      onSelectedOption={onSelect}
      className={className}
      optionsClassName="operator-option-dropdown"
      hideClearIcon
      iconLast
    />
  );
};

export default OperatorSelection;
