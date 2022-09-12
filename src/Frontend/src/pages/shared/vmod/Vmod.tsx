import { Pmod } from 'dnv-vista-sdk';
import React, { useEffect, useState } from 'react';
import GmodViewer from '../../../components/search/gmod-viewer/GmodViewer';
import TreeButtons from '../../../components/search/tree-buttons/TreeButtons';
import ResultBar from '../../../components/shared/result-bar/ResultBar';
import Icon from '../../../components/ui/icons/Icon';
import { IconName } from '../../../components/ui/icons/icons';
import Loader from '../../../components/ui/loader/Loader';
import RadioSelection from '../../../components/ui/radio/radio-selection/RadioSelection';
import CustomLink from '../../../components/ui/router/CustomLink';
import ScrollableField from '../../../components/ui/scrollable-field/ScrollableField';
import Tooltip from '../../../components/ui/tooltip/Tooltip';
import { useLabContext } from '../../../context/LabContext';
import { useSearchContext } from '../../../context/SearchContext';
import { RoutePath } from '../../Routes';
import './Vmod.scss';

export enum VesselMode {
  Any = 'Any',
  PrimaryItem = 'Primary item',
  SecondaryItem = 'Secondary item',
}

const VesselComp: React.FC = () => {
  const { vessel } = useLabContext();
  const { getVmodForVessel, mode, setMode } = useSearchContext();
  const [loading, setLoading] = useState(false);
  const [vmod, setVmod] = useState<Pmod>();

  useEffect(() => {
    setLoading(true);
    if ('vessels' in vessel) {
      getVmodForVessel(vessel.vessels.map(v => v.id))
        .then(setVmod)
        .finally(() => setLoading(false));
    } else {
      getVmodForVessel([vessel.id])
        .then(setVmod)
        .finally(() => setLoading(false));
    }
  }, [vessel, getVmodForVessel, setLoading, setVmod]);

  return (
    <>
      <ResultBar className={'vessel-result-bar'}>
        {vessel.id !== 'fleet' ? (
          <CustomLink persistSearch persistRestOfUrl className={'back'} to={RoutePath.Fleet}>
            <Tooltip content={<div>Back to fleet</div>}>
              <Icon icon={IconName.LeftArrow} />
            </Tooltip>
            {vessel.name}
          </CustomLink>
        ) : (
          <p>Fleet</p>
        )}
      </ResultBar>
      <ScrollableField className={'vmod-container'}>
        <div className={'header'}>
          <RadioSelection
            className={'mode-selection'}
            options={Object.entries(VesselMode).map((k, i) => ({ index: i, label: k[1] }))}
            onChange={option => {
              setMode(option.label as VesselMode);
            }}
            selectedOption={{ index: Object.values(VesselMode).indexOf(mode), label: mode }}
          />
          <TreeButtons />
        </div>
        {loading ? <Loader /> : vmod ? <GmodViewer pmod={vmod} /> : <span>No available nodes</span>}
      </ScrollableField>
    </>
  );
};

export default VesselComp;
