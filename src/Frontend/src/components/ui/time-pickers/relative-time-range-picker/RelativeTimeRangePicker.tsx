import React, { FormEvent, useCallback, useRef, useState } from 'react';
import useOutsideClick from '../../../../hooks/use-outside-click';
import Button from '../../button/Button';
import Icon from '../../icons/Icon';
import { IconName } from '../../icons/icons';
import Input from '../../input/Input';
import ScrollableField from '../../scrollable-field/ScrollableField';
import './RelativeTimeRangePicker.scss';
import { InputState, RelativeTimeRange, TimeOption } from './types';
import {
  isRangeValid,
  isRelativeFormat,
  keyForOption,
  mapOptionToRelativeTimeRange,
  mapRelativeTimeRangeToOption,
  quickOptions,
} from './util';

interface Props {
  onChange: (range: RelativeTimeRange) => void;
  timeRange: RelativeTimeRange;
}
const validOptions = quickOptions.filter(o => isRelativeFormat(o.from.toString()));

const RelativeTimeRangePicker: React.FC<Props> = ({ onChange, timeRange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const onClose = useCallback(() => setIsOpen(false), []);

  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, undefined, onClose);

  const timeOption = mapRelativeTimeRangeToOption(timeRange);

  const [from, setFrom] = useState<InputState>({
    value: timeOption.from.toString(),
    validation: isRangeValid(timeOption.from.toString()),
  });
  const [to, setTo] = useState<InputState>({
    value: timeOption.to.toString(),
    validation: isRangeValid(timeOption.to.toString()),
  });

  const onChangeTimeOption = (option: TimeOption) => {
    const optFrom = mapOptionToRelativeTimeRange(option);
    if (!optFrom) return;

    onClose();
    setFrom({ ...from, value: option.from.toString() });
    setTo({ ...to, value: option.to.toString() });
    onChange(optFrom);
  };

  const onOpen = useCallback(
    (event: FormEvent<HTMLDivElement>) => {
      event.stopPropagation();
      event.preventDefault();
      setIsOpen(!isOpen);
    },
    [isOpen]
  );

  const onApply = (event: FormEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (!to.validation.isValid || !from.validation.isValid) {
      return;
    }

    onChangeTimeOption({ from: from.value, to: to.value, display: '' });
    setIsOpen(false);
  };

  return (
    <div className={'relative-time-range-picker-container'} ref={ref}>
      <div tabIndex={0} className={'relative-time-range-picker-picker-input'} onClick={onOpen}>
        <Icon icon={IconName.Clock} className={'time-range-clock-icon'} />
        <span>{timeOption.display}</span>
        <span className={'relative-time-range-picker-caret-icon'}>
          <Icon icon={isOpen ? IconName.AngleUp : IconName.AngleDown} />
        </span>
      </div>
      {isOpen && (
        <div className={'relative-time-range-picker-content'}>
          <ScrollableField className={'relative-time-range-picker-left-side'}>
            <p className={'relative-time-range-picker-title'}>Time ranges</p>
            <ul className={'relative-time-range-picker-time-ranges'}>
              {validOptions.map((o, index) => (
                <li
                  key={keyForOption(o, index)}
                  onClick={() => onChangeTimeOption(o)}
                  tabIndex={0}
                  className={'relative-time-range-picker-option'}
                >
                  {o.display}
                </li>
              ))}
            </ul>
          </ScrollableField>
          <div className={'relative-time-range-picker-right-side'}>
            <p className={'relative-time-range-picker-title'}>Specify time range</p>
            <label>From</label>
            <Input
              hideClearIcon
              onClick={event => event.stopPropagation()}
              onBlur={() => setFrom({ ...from, validation: isRangeValid(from.value) })}
              onChange={event => event && setFrom({ ...from, value: event.currentTarget.value })}
              value={from.value}
            />
            <label>To</label>
            <Input
              hideClearIcon
              onClick={event => event.stopPropagation()}
              onBlur={() => setTo({ ...to, validation: isRangeValid(to.value) })}
              onChange={event => event && setTo({ ...to, value: event.currentTarget.value })}
              value={to.value}
            />
            <Button aria-label="TimePicker submit button" onClick={onApply}>
              Apply time range
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RelativeTimeRangePicker;
