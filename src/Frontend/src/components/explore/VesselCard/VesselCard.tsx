import React, { useMemo } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Vessel } from '../../../pages/explore/vessel/Vessel';
import FlipCard from '../../ui/flip-card/FlipCard';
import Icon from '../../ui/icons/Icon';
import { IconName } from '../../ui/icons/icons';
import StatusIcon, { StatusVariant } from '../../ui/status-icon/StatusIcon';
import TextWithIcon from '../../ui/text/TextWithIcon';
import './VesselCard.scss';

interface Props {
  vessel: Vessel;
}

const VesselCard: React.FC<Props> = ({ vessel }) => {
  const location = useLocation();
  const [params] = useSearchParams();
  const searchQuery = useMemo(() => params.get('query'), [params]);

  return (
    <Link
      className={'vessel-card'}
      to={`${location.pathname}/${vessel.vesselId}${searchQuery ? `?query=${searchQuery}` : ''}`}
    >
      <FlipCard
        className="vessel-card-content"
        front={
          <div className={'card-info'}>
            <div className={'vessel-icon-container'}>
              <Icon className={'vessel-icon'} icon={IconName.Ship} />
            </div>
            <div>{vessel.vesselId}</div>
            <StatusIcon variant={StatusVariant.Good} />
          </div>
        }
        back={
          <div className={'card-info'}>
            <TextWithIcon icon={IconName.Hashtag}>{vessel.vesselId}</TextWithIcon>
            <TextWithIcon icon={IconName.RSS}>{vessel.numDataChannels}</TextWithIcon>
            <StatusIcon variant={StatusVariant.Good} />
          </div>
        }
      />
    </Link>
  );
};

export default VesselCard;
