import { CodebookNames, DataChannelList, MetadataTag, ShipId } from 'dnv-vista-sdk';
import React, { useEffect, useMemo, useState } from 'react';
import { VistaLabApi } from '../../../apiConfig';
import { TimeSeriesDataWithProps } from '../../../client';
import Icon from '../../ui/icons/Icon';
import { IconName } from '../../ui/icons/icons';
import Loader from '../../ui/loader/Loader';
import './DataChannelCard.scss';

interface Props {
  dataChannel: DataChannelList.DataChannel;
  shipId?: ShipId;
  mode: CardMode;
  extraNodes?: React.ReactNode;
  onClick?: { (): void };
  disabled?: boolean;
  withoutData?: boolean;
}

export enum CardMode {
  LegacyNameCentric,
}

const DataChannelCard: React.FC<Props> = (props: Props) => {
  const { dataChannel, shipId, extraNodes, onClick, disabled, withoutData = false } = props;
  const [loading, setLoading] = useState(false);
  const [latestEventData, setLatestEventData] = useState<TimeSeriesDataWithProps>();

  const localId = useMemo(() => dataChannel.dataChannelId.localId, [dataChannel]);

  useEffect(() => {
    if (localId && !withoutData) {
      setLoading(true);

      VistaLabApi.dataChannelGetLatestTimeSeriesValue({
        vesselId: shipId ? shipId.toString() : dataChannel.property.customProperties?.shipId.toString() ?? 'fleet',
        localId: localId.toString(),
      })
        .then(res => {
          if (res.eventData) {
            setLatestEventData(res);
          } else {
            setLatestEventData(undefined);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [localId, setLatestEventData, setLoading, shipId, withoutData, dataChannel]);

  const parts: { key: string; noSep?: boolean; el: React.ReactNode }[] = [];
  if (shipId) {
    parts.push({
      key: 'imo',
      el: (
        <div className={'vessel-id-wrapper'}>
          <Icon icon={IconName.Ship} className={'vessel-icon'} />
          <span className={'vessel-id'}>{shipId.toString()}</span>{' '}
        </div>
      ),
    });
  }

  parts.push({
    key: 'name',
    noSep: true,
    el: <span>{dataChannel.property.name}</span>,
  });

  const getTinyTitle = () => {
    const tags = CodebookNames.names.map(n => localId.getMetadataTag(n)).filter((t): t is MetadataTag => !!t);

    return (
      <>
        <b>{localId.primaryItem!.toString()}</b>
        {localId.secondaryItem && (
          <>
            <span>/sec/</span>
            <b>{localId.secondaryItem.toString()}</b>
          </>
        )}
        <span>/meta</span>
        {tags.map(t => {
          return (
            <span key={t.name}>
              <span>
                /{CodebookNames.toPrefix(t.name)}
                {t.prefix}
              </span>
              <b>{t.value}</b>
            </span>
          );
        })}
      </>
    );
  };

  return (
    <div className={`data-channel-card compact ${disabled ? 'disabled' : ''}`} onClick={onClick}>
      <div className={'data-channel-card-c-titles'}>
        <div className={'data-channel-card-c-title-tiny'}>{getTinyTitle()}</div>
        <div className={'data-channel-card-c-title'}>
          {parts.map((p, i) => {
            return (
              <span key={p.key}>
                {i > 0 && !p.noSep && <span className={'separator'}>|</span>}
                {p.el}
              </span>
            );
          })}
        </div>
      </div>
      <div className={'data-channel-card-c-value'}>
        {loading ? (
          <Loader />
        ) : (
          <>
            {latestEventData?.eventData?.Value && (
              <>
                <span className={'timeseries-data'}>{latestEventData.eventData.Value}</span>
              </>
            )}
            {latestEventData?.additionalProps?.unitSymbol && (
              <span className={'timeseries-data unit'}>{latestEventData.additionalProps.unitSymbol}</span>
            )}
          </>
        )}
      </div>
      {extraNodes}
    </div>
  );
};

export default React.memo(DataChannelCard);
