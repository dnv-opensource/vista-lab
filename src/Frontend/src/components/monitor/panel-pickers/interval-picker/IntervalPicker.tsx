import React, { useCallback, useMemo } from 'react';
import { Panel, usePanelContext } from '../../../../context/PanelContext';
import { IconName } from '../../../ui/icons/icons';
import Input, { InputTypes } from '../../../ui/input/Input';
import './IntervalPicker.scss';

interface Props {
  panel?: Panel;
}

const IntervalPicker: React.FC<Props> = ({ panel }) => {
  const { editPanel, interval, setInterval } = usePanelContext();

  const currentInterval = useMemo(() => (panel?.interval ? panel.interval : interval), [panel, interval]);

  const currentSetInterval = useCallback(
    (interval: string) => {
      if (!panel) return setInterval(interval);
      return editPanel({ ...panel, interval: interval });
    },
    [panel, editPanel, setInterval]
  );

  const isValid = useCallback((value: InputTypes): boolean => {
    const v = value?.toString();
    if (!v) return true;
    if (!v.endsWith('s')) return false;
    if (isNaN(+v[0])) return false;

    return true;
  }, []);

  const onInputChange = useCallback(
    (e?: React.ChangeEvent<HTMLInputElement>) => {
      if (!e) return;
      const value = e.currentTarget.value;
      if (!isValid(value)) return;

      currentSetInterval(value);
    },
    [isValid, currentSetInterval]
  );

  return (
    <>
      <Input
        icon={IconName.ArrowsLeftRightToLine}
        value={currentInterval}
        onChange={onInputChange}
        className={'interval-picker'}
        hideClearIcon
      />
    </>
  );
};

export default IntervalPicker;
