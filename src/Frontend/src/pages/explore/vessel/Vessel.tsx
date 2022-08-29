import { Pmod } from 'dnv-vista-sdk';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import GmodViewer from '../../../components/explore/gmod-viewer/GmodViewer';
import ResultBar from '../../../components/shared/result-bar/ResultBar';
import Icon from '../../../components/ui/icons/Icon';
import { IconName } from '../../../components/ui/icons/icons';
import LinkWithQuery from '../../../components/ui/link-with-query/LinkWithQuery';
import Loader from '../../../components/ui/loader/Loader';
import RadioSelection from '../../../components/ui/radio/radio-selection/RadioSelection';
import ScrollableField from '../../../components/ui/scrollable-field/ScrollableField';
import StatusIcon, { StatusVariant } from '../../../components/ui/status-icon/StatusIcon';
import { useExploreContext } from '../../../context/ExploreContext';
import './Vessel.scss';

export type Vessel = {
  numDataChannels?: number;
  vesselId?: string;
  status?: number;
};

export enum VesselMode {
  All = 0,
  Equipment = 1,
  Consequence = 2,
}

const VesselComp: React.FC = () => {
  const { getVmodForVessel, mode, setMode } = useExploreContext();
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

  useEffect(() => {
    return () => setMode(VesselMode.All);
  }, [setMode]);

  return (
    <>
      <ResultBar className={'vessel-result-bar'}>
        <LinkWithQuery className={'back'} to={'/explore'} queryKey="query">
          <Icon icon={IconName.LeftArrow} />
          {vesselId}
        </LinkWithQuery>
        <div className={'status'}>
          <span>Status</span>
          <StatusIcon variant={StatusVariant.Good} />
        </div>
      </ResultBar>
      <ScrollableField className={'vmod-container'}>
        <RadioSelection
          className={'mode-selection'}
          options={Object.entries(VesselMode)
            .filter(([k, _]) => isNaN(+k))
            .map(([key, index]) => ({ index: +index, label: key }))}
          onChange={option => {
            setMode(option.index);
          }}
          selectedOption={{ index: mode, label: VesselMode[mode] }}
        />
        {loading ? <Loader /> : vmod ? <GmodViewer pmod={vmod} /> : <span>No available nodes</span>}
      </ScrollableField>
    </>
  );
};

export default VesselComp;
