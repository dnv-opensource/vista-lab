import React, { useCallback, useMemo } from 'react';
import { Experiment, useExperimentContext } from '../../../../context/ExperimentContext';
import { IconName } from '../../../ui/icons/icons';
import Input, { InputTypes } from '../../../ui/input/Input';
import './IntervalPicker.scss';

interface Props {
  experiment?: Experiment;
}

const IntervalPicker: React.FC<Props> = ({ experiment }) => {
  const { editExperiment, interval, setInterval } = useExperimentContext();

  const currentInterval = useMemo(
    () => (experiment?.interval ? experiment.interval : interval),
    [experiment, interval]
  );

  const currentSetInterval = useCallback(
    (interval: string) => {
      if (!experiment) return setInterval(interval);
      return editExperiment({ ...experiment, interval: interval });
    },
    [experiment, editExperiment, setInterval]
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
