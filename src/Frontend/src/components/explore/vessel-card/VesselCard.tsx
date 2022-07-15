import React from 'react';
import { Vessel } from '../../../pages/explore/vessel/Vessel';
import FlipCard from '../../ui/flip-card/FlipCard';
import Icon from '../../ui/icons/Icon';
import { IconName } from '../../ui/icons/icons';
import LinkWithQuery from '../../ui/link-with-query/LinkWithQuery';
import StatusIcon, { StatusVariant } from '../../ui/status-icon/StatusIcon';
import TextWithIcon from '../../ui/text/TextWithIcon';
import './VesselCard.scss';

interface Props {
  vessel: Vessel;
}

const VesselCard: React.FC<Props> = ({ vessel }) => {
  return (
    <LinkWithQuery className={'vessel-card'} to={`${vessel.vesselId}`} queryKey="query">
      <FlipCard
        className="vessel-card-content"
        front={
          <div className={'card-info'}>
            <div className={'vessel-icon-container'}>
              <Icon className={'vessel-icon'} icon={IconName.Ship} />
            </div>
            <div>{vessel.vesselId ?? 'Unknown vessel'}</div>
            <StatusIcon variant={StatusVariant.Good} />
          </div>
        }
        back={
          <div className={'card-info'}>
            <TextWithIcon icon={IconName.Hashtag}>{vessel.vesselId ?? 'Unknown vessel'}</TextWithIcon>
            <TextWithIcon icon={IconName.RSS}>{vessel.numDataChannels}</TextWithIcon>
            <StatusIcon variant={StatusVariant.Good} />
          </div>
        }
      />
    </LinkWithQuery>
  );
};

export default VesselCard;
