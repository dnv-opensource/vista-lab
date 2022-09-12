import { Pmod } from 'dnv-vista-sdk';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import GmodViewer from '../../../components/search/gmod-viewer/GmodViewer';
import TreeButtons from '../../../components/search/tree-buttons/TreeButtons';
import ResultBar from '../../../components/shared/result-bar/ResultBar';
import Icon from '../../../components/ui/icons/Icon';
import { IconName } from '../../../components/ui/icons/icons';
import Loader from '../../../components/ui/loader/Loader';
import RadioSelection from '../../../components/ui/radio/radio-selection/RadioSelection';
import ScrollableField from '../../../components/ui/scrollable-field/ScrollableField';
import StatusIcon, { StatusVariant } from '../../../components/ui/status-icon/StatusIcon';
import { useSearchContext } from '../../../context/SearchContext';
import { RoutePath } from '../../Routes';
import './Vessel.scss';
import CustomLink from '../../../components/ui/router/CustomLink';

export type Vessel = {
  numDataChannels?: number;
  vesselId?: string;
  name?: string;
  status?: number;
};

export enum VesselMode {
  Any = 'Any',
  PrimaryItem = 'Primary item',
  SecondaryItem = 'Secondary item',
}

const VesselComp: React.FC = () => {
  const { getVmodForVessel, mode, setMode } = useSearchContext();
  const { vesselId } = useParams();
  const [loading, setLoading] = useState(false);
  const [vmod, setVmod] = useState<Pmod>();

  useEffect(() => {
    if (!vesselId) return;
    setLoading(true);
    getVmodForVessel(vesselId)
      .then(setVmod)
      .finally(() => setLoading(false));
  }, [vesselId, getVmodForVessel, setLoading, setVmod]);

  return (
    <>
      <ResultBar className={'vessel-result-bar'}>
        <CustomLink persistSearch className={'back'} to={RoutePath.Search}>
          <Icon icon={IconName.LeftArrow} />
          {vesselId}
        </CustomLink>
        <div className={'status'}>
          <span>Status</span>
          <StatusIcon variant={StatusVariant.Good} />
        </div>
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
