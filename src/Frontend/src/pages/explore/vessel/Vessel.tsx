import { LocalId } from 'dnv-vista-sdk';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ResultBar from '../../../components/shared/result-bar/ResultBar';
import Icon from '../../../components/ui/icons/Icon';
import { IconName } from '../../../components/ui/icons/icons';
import LinkWithQuery from '../../../components/ui/link-with-query/LinkWithQuery';
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
  Equipment,
  Consequence,
}

const VesselComp: React.FC = () => {
  const { getVmodForVessel } = useExploreContext();
  const { vesselId } = useParams();

  const [vmod, setVmod] = useState<LocalId[]>();

  useEffect(() => {
    getVmodForVessel(vesselId).then(setVmod);
  }, [vesselId, getVmodForVessel]);

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
        />
        {vmod?.map(d => <p>{d.toString()}</p>) ?? 'No datachannels found for this query'}
      </ScrollableField>
    </>
  );
};

export default VesselComp;
