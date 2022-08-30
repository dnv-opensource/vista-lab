import { CodebookName, UniversalId } from 'dnv-vista-sdk';
import React, { useEffect, useMemo, useState } from 'react';
import { VistaLabApi } from '../../../apiConfig';
import { TimeSeriesDataWithProps } from '../../../client';
import { capitalize } from '../../../util/string';
import Icon from '../../ui/icons/Icon';
import { IconName } from '../../ui/icons/icons';
import Loader from '../../ui/loader/Loader';
import StatusIcon, { StatusVariant } from '../../ui/status-icon/StatusIcon';
import TextWithIcon from '../../ui/text/TextWithIcon';
import Tooltip from '../../ui/tooltip/Tooltip';
import './DataChannelCard.scss';

interface Props {
  universalId: UniversalId;
}

const DataChannelCard: React.FC<Props> = ({ universalId }) => {
  const localId = useMemo(() => universalId.localId, [universalId]);
  const [loading, setLoading] = useState(false);
  const [latestEventData, setLatestEventData] = useState<TimeSeriesDataWithProps>();

  useEffect(() => {
    if (localId) {
      setLoading(true);

      VistaLabApi.dataChannelGetLatestTimeSeriesValue({ localId: localId.toString() })
        .then(res => {
          if (res.eventData) {
            setLatestEventData(res);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [localId, setLatestEventData, setLoading]);

  const formatCodebookValue = (value: string) => {
    return capitalize(value.replaceAll('.', ' '));
  };

  // Example of status calculations
  const dataChannelStatus = useMemo((): { status: StatusVariant; info: string } => {
    if (
      !latestEventData ||
      !latestEventData.eventData ||
      !latestEventData.additionalProps ||
      !latestEventData.eventData.Value
    )
      return { status: StatusVariant.Warning, info: 'Missing recorded data' };

    const { Value: value } = latestEventData.eventData;
    const { rangeHigh, rangeLow } = latestEventData.additionalProps;

    if (rangeHigh && !isNaN(+value)) {
      if (+value > rangeHigh) {
        return { status: StatusVariant.Danger, info: 'Value is below upper range limit' };
      }
      if (+value > rangeHigh * 0.8) {
        return { status: StatusVariant.Warning, info: 'Value is close to upper range limit' };
      }
    }

    if (rangeLow && !isNaN(+value)) {
      if (+value < rangeLow) {
        return { status: StatusVariant.Danger, info: 'Value is below lower range limit' };
      }
      if (+value < rangeLow * 0.8) {
        return { status: StatusVariant.Warning, info: 'Value is close to lower range limit' };
      }
    }

    return { status: StatusVariant.Good, info: 'Status ok' };
  }, [latestEventData]);

  return (
    <div className={'data-channel-card'}>
      <div className={'channel-card-header'}>
        <Icon icon={IconName.RSS} className={'rss-header-icon'} />
        <div className={'vessel-info-placeholder'}>
          <TextWithIcon icon={IconName.Ship} className={'vessel-info'}>
            IMO{universalId.imoNumber.toString()}
          </TextWithIcon>
        </div>
        <div className={'status-n-data'}>
          {loading ? (
            <Loader />
          ) : (
            <>
              <span className={'timeseries-data'}>{latestEventData?.eventData?.Value ?? 'No recorded data'}</span>
              <span className={'timeseries-data'}>{latestEventData?.additionalProps?.unitSymbol}</span>
            </>
          )}
          <Tooltip content={dataChannelStatus.info}>
            <StatusIcon variant={dataChannelStatus.status} />
          </Tooltip>
        </div>
      </div>
      {localId.primaryItem && (
        <div className={'local-id-item'}>
          <TextWithIcon className={'codebook-name'} icon={IconName.Microchip}>
            {localId.primaryItem.toString()}
          </TextWithIcon>
          <span className={'codebook-value'}>{localId.primaryItem.toNamesString()}</span>
        </div>
      )}
      {localId.secondaryItem && (
        <div className={'local-id-item'}>
          <Tooltip
            className={'context-tooltip'}
            content={
              <>
                <i>{localId.primaryItem!.toNamesString()}</i>
                <b>serving</b>
                <i>{localId.secondaryItem.toNamesString()}</i>
              </>
            }
          >
            <TextWithIcon className={'codebook-name'} icon={IconName.Link}>
              {localId.secondaryItem.toString()}
            </TextWithIcon>
          </Tooltip>
          <span className={'codebook-value'}>{localId.secondaryItem.toNamesString()}</span>
        </div>
      )}
      {localId.builder.metadataTags.map(meta => (
        <div key={meta.name} className={'local-id-item'}>
          <TextWithIcon className={'codebook-name'} icon={IconName.Tag}>
            {CodebookName[meta.name]}
          </TextWithIcon>
          <span className={'codebook-value'}>{formatCodebookValue(meta.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default React.memo(DataChannelCard);
