import { CodebookName, LocalId } from 'dnv-vista-sdk';
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
  localId: LocalId;
}

const DataChannelCard: React.FC<Props> = ({ localId }) => {
  const [loading, setLoading] = useState(true);
  const [latestEventData, setLatestEventData] = useState<TimeSeriesDataWithProps>();

  useEffect(() => {
    if (localId) {
      setLoading(false);

      VistaLabApi.DataChannelApi.dataChannelGetLatestTimeSeriesValue({
        timeSeriesRequestDto: { localId: localId.toString() },
      })
        .then(res => {
          if (res.eventData) {
            console.log(res);

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
      !latestEventData.eventData.value
    )
      return { status: StatusVariant.Warning, info: 'Missing recorded data' };

    const { value } = latestEventData.eventData;
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
        <Icon icon={IconName.RSS} />
        <div className={'status-n-data'}>
          {loading ? (
            <Loader />
          ) : (
            <>
              <span className={'timeseries-data'}>{latestEventData?.eventData?.value ?? 'No recorded data'}</span>
              <span className={'timeseries-data'}>{latestEventData?.additionalProps?.unitSymbol}</span>
            </>
          )}
          <Tooltip content={dataChannelStatus.info}>
            <StatusIcon variant={dataChannelStatus.status} />
          </Tooltip>
        </div>
      </div>

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
