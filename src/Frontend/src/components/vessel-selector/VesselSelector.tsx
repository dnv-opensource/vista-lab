import React, { useCallback, useMemo } from 'react';
import { useLabContext, Vessel } from '../../context/LabContext';
import { useCustomNavigate } from '../../hooks/use-custom-navigate';
import { IconName } from '../ui/icons/icons';
// import CustomLink from '../ui/router/CustomLink';
import Typeahead, { TypeaheadOption } from '../ui/typeahead/Typeahead';
import './VesselSelector.scss';

const VesselSelector: React.FC = () => {
  const { fleet, vessel } = useLabContext();
  const navigate = useCustomNavigate({ persistRestOfUrl: true, persistSearch: true });

  const options: Vessel[] = useMemo(
    () => [...fleet.vessels, { id: fleet.id, numberDataChannels: 0, name: fleet.name }],
    [fleet]
  );

  const formatter = useCallback(
    (option: Vessel): TypeaheadOption<Vessel> => ({ option, value: option.name ?? option.id }),
    []
  );

  const onSelect = useCallback(
    (option: Vessel) => {
      navigate(`/${option.id}`, { replace: true });
    },
    [navigate]
  );

  return (
    <Typeahead
      className={'vessel-selector'}
      formatter={formatter}
      options={options}
      onSelectedOption={onSelect}
      value={vessel.name}
      icon={IconName.Ship}
    />
  );
};

export default VesselSelector;
