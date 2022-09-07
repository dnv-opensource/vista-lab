import { CodebookName, CodebookNames, MetadataTag, UniversalId } from 'dnv-vista-sdk';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { VistaLabApi } from '../../../apiConfig';
import { DataChannel, TimeSeriesDataWithProps } from '../../../client';
import { capitalize } from '../../../util/string';
import Icon from '../../ui/icons/Icon';
import { IconName } from '../../ui/icons/icons';
import Loader from '../../ui/loader/Loader';
import StatusIcon, { StatusVariant } from '../../ui/status-icon/StatusIcon';
import TextWithIcon from '../../ui/text/TextWithIcon';
import Tooltip from '../../ui/tooltip/Tooltip';
import './DataChannelCard.scss';

interface Props {
  dataChannel: DataChannel;
  mode: CardMode;
}

export enum CardMode {
    LegacyNameCentric,
}

const DataChannelCard: React.FC<Props> = (props: Props) => {
  const { dataChannel } = props;
  const [loading, setLoading] = useState(false);
  const [latestEventData, setLatestEventData] = useState<TimeSeriesDataWithProps>();

  const { vesselId } = useParams();

  const universalId = useMemo(() => ((dataChannel.Property as any)['UniversalID'] as UniversalId), [dataChannel]);
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

//   const formatCodebookValue = (value: string) => {
//     return capitalize(value.replaceAll('.', ' '));
//   };

//   // Example of status calculations
//   const dataChannelStatus = useMemo((): { status: StatusVariant; info: string } => {
//     if (
//       !latestEventData ||
//       !latestEventData.eventData ||
//       !latestEventData.additionalProps ||
//       !latestEventData.eventData.Value
//     )
//       return { status: StatusVariant.Warning, info: 'Missing recorded data' };

//     const { Value: value } = latestEventData.eventData;
//     const { rangeHigh, rangeLow } = latestEventData.additionalProps;

//     if (rangeHigh && !isNaN(+value)) {
//       if (+value > rangeHigh) {
//         return { status: StatusVariant.Danger, info: 'Value is below upper range limit' };
//       }
//       if (+value > rangeHigh * 0.8) {
//         return { status: StatusVariant.Warning, info: 'Value is close to upper range limit' };
//       }
//     }

//     if (rangeLow && !isNaN(+value)) {
//       if (+value < rangeLow) {
//         return { status: StatusVariant.Danger, info: 'Value is below lower range limit' };
//       }
//       if (+value < rangeLow * 0.8) {
//         return { status: StatusVariant.Warning, info: 'Value is close to lower range limit' };
//       }
//     }

//     return { status: StatusVariant.Good, info: 'Status ok' };
//   }, [latestEventData]);


  const parts: { key: string; noSep?: boolean; el: React.ReactNode }[] = [];
  if (vesselId === 'all') {
      parts.push({ key: 'imo', el: (<span>{vesselId}</span>) });
  }
//   const primaryItem = localId.primaryItem;
//   parts.push({
//       key: 'pi',
//       noSep: true,
//       el: (
//           <span><Icon icon={IconName.RSS} /> {primaryItem?.getCurrentCommonName()}</span>
//       )
//   });

//   if (localId.secondaryItem) {
//       const secondaryItem = localId.secondaryItem;
//       parts.push({
//           key: 'si',
//           noSep: true,
//           el: (
//               <span><Icon icon={IconName.Link} /> {secondaryItem?.getCurrentCommonName()}</span>
//           )
//       });
//   }

  parts.push({
    key: 'name',
    noSep: true,
    el: (
        <span>{dataChannel.Property.Name}</span>
    )
  });


//   const tags = CodebookNames.names.map(n => localId.getMetadataTag(n)).filter((t): t is MetadataTag => !!t);
//   parts.push({
//       key: 'meta',
//       noSep: true,
//       el: (
//           <span className={'tags'}>
//               <Icon icon={IconName.Tag} style={{ marginTop: '0.25em' }} />
//               {tags.map(t => (<span key={`tags-${t.name.toString()}`}>
//                   <span className={'name'}>{CodebookNames.toPrefix(t.name)}=</span>
//                   <span className={'value'}>{t.value}</span>
//               </span>))}
//           </span>
//       )
//   });

  return (
    <div className={`data-channel-card compact`}>
      <div className={'data-channel-card-c-title-tiny'}>
            {vesselId === 'all' ? universalId.toString() : localId.toString()}
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
    </div>
  );
};

export default React.memo(DataChannelCard);
