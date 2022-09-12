import React from 'react';
import { useLocation } from 'react-router-dom';
import { Vessel } from '../../../context/LabContext';
import FlipCard from '../../ui/flip-card/FlipCard';
import Icon from '../../ui/icons/Icon';
import { IconName } from '../../ui/icons/icons';
import CustomLink from '../../ui/router/CustomLink';
import StatusIcon, { StatusVariant } from '../../ui/status-icon/StatusIcon';
import TextWithIcon from '../../ui/text/TextWithIcon';
import './VesselCard.scss';

interface Props {
  vessel: Vessel;
}

const VesselCard: React.FC<Props> = ({ vessel }) => {
  const location = useLocation();

  const desination = location.pathname.endsWith('report') ? 'report' : 'search';

  return (
    <CustomLink persistSearch className={'vessel-card'} to={`/${vessel.id}/${desination}`}>
      <FlipCard
        className="vessel-card-content"
        front={
          <div className={'card-info'}>
            <div className={'vessel-icon-container'}>
              <Icon className={'vessel-icon'} icon={IconName.Ship} />
            </div>
            <div className="name">{vessel.name ?? 'Unknown vessel'}</div>
            <div className="imo">{vessel.id ?? 'Unknown vessel'}</div>
            <StatusIcon variant={StatusVariant.Good} />
          </div>
        }
        back={
          <div className={'card-info'}>
            <TextWithIcon icon={IconName.Hashtag}>{vessel.id ?? 'Unknown vessel'}</TextWithIcon>
            <TextWithIcon icon={IconName.RSS}>{vessel.numberDataChannels}</TextWithIcon>
            <StatusIcon variant={StatusVariant.Good} />
          </div>
        }
      />
    </CustomLink>
  );
};

export default VesselCard;
