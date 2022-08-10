import { CodebookName, LocalId } from 'dnv-vista-sdk';
import React from 'react';
import { capitalize } from '../../../util/string';
import Icon from '../../ui/icons/Icon';
import { IconName } from '../../ui/icons/icons';
import StatusIcon, { StatusVariant } from '../../ui/status-icon/StatusIcon';
import TextWithIcon from '../../ui/text/TextWithIcon';
import './DataChannelCard.scss';

interface Props {
  localId: LocalId;
}

const DataChannelCard: React.FC<Props> = ({ localId }) => {
  return (
    <div className={'data-channel-card'}>
      <div className={'channel-card-header'}>
        <Icon icon={IconName.RSS} />
        <StatusIcon variant={StatusVariant.Good} />
      </div>
      {localId.builder.metadataTags.map(meta => (
        <div className={'local-id-item'}>
          <TextWithIcon className={'codebook-name'} icon={IconName.Tag}>
            {CodebookName[meta.name]}
          </TextWithIcon>
          <span className={'codebook-value'}>{capitalize(meta.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default React.memo(DataChannelCard);
