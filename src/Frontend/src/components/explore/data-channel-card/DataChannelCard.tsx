import { CodebookNames, MetadataTag } from 'dnv-vista-sdk';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { VistaLabApi } from '../../../apiConfig';
import { TimeSeriesDataWithProps } from '../../../client';
import { DataChannelWithShipData } from '../../../context/ExploreContext';
import Loader from '../../ui/loader/Loader';
import './DataChannelCard.scss';

interface Props {
  dataChannel: DataChannelWithShipData;
  mode: CardMode;
  extraNodes?: React.ReactNode;
}

export enum CardMode {
    LegacyNameCentric,
}

const DataChannelCard: React.FC<Props> = (props: Props) => {
  const { dataChannel, extraNodes } = props;
  const [loading, setLoading] = useState(false);
  const [latestEventData, setLatestEventData] = useState<TimeSeriesDataWithProps>();

  const { vesselId } = useParams();

  const universalId = useMemo(() => (dataChannel as DataChannelWithShipData).Property.UniversalID, [dataChannel]);
  const localId = useMemo(() => (universalId.localId), [universalId]);

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


  const parts: { key: string; noSep?: boolean; el: React.ReactNode }[] = [];
  if (vesselId === 'all') {
      parts.push({ key: 'imo', el: (<span>{vesselId}</span>) });
  }

  parts.push({
    key: 'name',
    noSep: true,
    el: (
        <span>{dataChannel.Property.Name}</span>
    )
  });

  const getTinyTitle = () => {
    const tags = CodebookNames.names.map(n => localId.getMetadataTag(n)).filter((t): t is MetadataTag => !!t);

    if (vesselId === 'all') {

    } else {
        return (
            <>
                <b>{localId.primaryItem!.toString()}</b>
                {localId.secondaryItem && (<><span>/sec/</span><b>{localId.secondaryItem.toString()}</b></>)}
                <span>/meta</span>
                {tags.map(t => {
                    return (
                        <span key={t.name}>
                            <span>/{CodebookNames.toPrefix(t.name)}{t.prefix}</span>
                            <b>{t.value}</b>
                        </span>
                    );
                })}
            </>
        );
    }
  }

  return (
    <div className={`data-channel-card compact`}>
        <div className={'data-channel-card-c-titles'}>
            <div className={'data-channel-card-c-title-tiny'}>
                {getTinyTitle()}
            </div>
            <div className={'data-channel-card-c-title'}>
                {parts.map((p, i) => {
                    return (
                        <span key={p.key}>
                            {i > 0 && !p.noSep && <span className={'separator'} >|</span>}
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
