import React, { useEffect, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import ResultBar from '../../../components/shared/result-bar/ResultBar';
import Icon from '../../../components/ui/icons/Icon';
import { IconName } from '../../../components/ui/icons/icons';
import StatusIcon, { StatusVariant } from '../../../components/ui/status-icon/StatusIcon';
import './Vessel.scss';

export type Vessel = {
  numDataChannels: number;
  vesselId: string;
  status: number;
};

const VesselComp: React.FC = () => {
  const { vesselId } = useParams();
  const [searchParams] = useSearchParams();
  const queryParam = useMemo(() => searchParams.get('query'), [searchParams]);

  useEffect(() => {
    console.log('vesselId', vesselId);
  }, [vesselId]);

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

      <div>Vessel</div>
    </>
  );
};

export default VesselComp;
