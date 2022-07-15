import { LocalId } from 'dnv-vista-sdk';
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import ResultBar from '../../../components/shared/result-bar/ResultBar';
import Icon from '../../../components/ui/icons/Icon';
import { IconName } from '../../../components/ui/icons/icons';
import ScrollableField from '../../../components/ui/scrollable-field/ScrollableField';
import StatusIcon, { StatusVariant } from '../../../components/ui/status-icon/StatusIcon';
import { useExploreContext } from '../../../context/ExploreContext';
import './Vessel.scss';

export type Vessel = {
  numDataChannels?: number;
  vesselId?: string;
  status?: number;
};

const VesselComp: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryParam = useMemo(() => searchParams.get('query'), [searchParams]);

  const { getVmodForVessel } = useExploreContext();
  const { vesselId } = useParams();

  const [vmod, setVmod] = useState<LocalId[]>();

  useEffect(() => {
    getVmodForVessel(vesselId).then(setVmod);
  }, [vesselId, getVmodForVessel]);

  return (
    <>
      <ResultBar className={'vessel-result-bar'}>
        <Link className={'back'} to={`/explore${queryParam ? `?query=${queryParam}` : ''}`}>
          <Icon icon={IconName.LeftArrow} />
          {vesselId}
        </Link>
        <div className={'status'}>
          <span>Status</span>
          <StatusIcon variant={StatusVariant.Good} />
        </div>
      </ResultBar>
      <ScrollableField className={'vmod-container'}>
        {vmod?.map(d => <p>{d.toString()}</p>) ?? 'No datachannels found for this query'}
      </ScrollableField>
    </>
  );
};

export default VesselComp;
