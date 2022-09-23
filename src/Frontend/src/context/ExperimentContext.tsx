import { DataChannelList, DataChannelListDto, JSONExtensions } from 'dnv-vista-sdk';
import { isString } from 'lodash';
import React, { createContext, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { VistaLabApi } from '../apiConfig';
import { AggregatedQueryResult, DataChannel, Query as QueryDto, QueryOperator, TimeRange } from '../client';
import DataChannelCard, { CardMode } from '../components/search/data-channel-card/DataChannelCard';
import Icon from '../components/ui/icons/Icon';
import { IconName } from '../components/ui/icons/icons';
import { RelativeTimeRange } from '../components/ui/time-pickers/relative-time-range-picker/types';
import { Operator } from '../components/view-and-build/query-generator/operator-selection/OperatorSelection';
import useLocalStorage, { LocalStorageSerializer } from '../hooks/use-localstorage';
import useToast, { ToastType } from '../hooks/use-toast';
import { RoutePath } from '../pages/Routes';
import { nextChar } from '../util/string';
import { useLabContext } from './LabContext';
import { useVISContext } from './VISContext';

export type ExperimentContextType = {
  experiments: Experiment[];
  addDataChannelToExperiment: (experimentId: string, dataChannel: DataChannelList.DataChannel) => void;
  removeDataChannelFromExperiment: (experimentId: string, dataChannel: DataChannelList.DataChannel) => void;
  toggleQueryItemInExperiment: (experimentId: string, item: DataChannelList.DataChannel | Query) => void;
  addNewQueryToExperiment: (experimentId: string) => void;
  removeQueryFromExperiment: (experimentId: string, query: Query) => void;
  editQuery: (experimentId: string, query: Query) => void;
  setExperiments: React.Dispatch<React.SetStateAction<Experiment[]>>;
  addExperiment: (id: string) => void;
  editExperiment: (Experiment: Experiment) => void;
  renameExperiment: (experimentId: string, name: string) => void;
  deleteExperiment: (id: string) => void;
  getExperiment: (id: string) => Experiment;
  selectQueryItem: (experimentId: string, queryId: string, item: DataChannelList.DataChannel | Query) => void;
  selectQueryOperator: (experimentId: string, queryId: string, operator: Operator) => void;
  timeRange: RelativeTimeRange;
  setTimeRange: React.Dispatch<React.SetStateAction<RelativeTimeRange>>;
  interval: string;
  setInterval: React.Dispatch<React.SetStateAction<string>>;
  getTimeseriesDataForExperiment: (Experiment: Experiment) => Promise<AggregatedQueryResult[]>;
  saveDataChannelFromQuery: (dataChannel: DataChannelList.DataChannel, query: Query) => Promise<void>;
};

type ExperimentContextProviderProps = React.PropsWithChildren<{}>;

const ExperimentContext = createContext<ExperimentContextType | undefined>(undefined);

export type Experiment = {
  queries: Query[];
  dataChannels: DataChannelList.DataChannel[];
  queryItemsExcludedFromGraph: Set<string>;
  id: string;
  timeRange?: RelativeTimeRange;
  interval?: string;
  threshold?: Threshold;
};

export type Query = {
  id: string;
  name: string;
  operator?: Operator;
  items: (Query | DataChannelList.DataChannel)[];
};

export type Threshold = {
  value: number;
  /**@description Converted to percentage */
  deviation?: number;
  name: string;
};

type SerializableQuery = Omit<Query, 'items'> & {
  items: (string | DataChannelListDto.DataChannel)[];
};

type SerializableExperiment = Omit<Experiment, 'dataChannels' | 'queries' | 'queryItemsExcludedFromGraph'> & {
  queries: SerializableQuery[];
  dataChannels: DataChannelListDto.DataChannel[];
  queryItemsExcludedFromGraph: string[];
};

export function isDataChannelQueryItem(
  item: Query | DataChannelList.DataChannel
): item is DataChannelList.DataChannel {
  return 'dataChannelId' in item;
}

export const toQueryDto = (q: Query): QueryDto => {
  const operatorDto: QueryOperator = +Object.keys(QueryOperator)[
    Object.values(Operator).indexOf(q.operator!)
  ] as QueryOperator;

  return {
    name: q.name,
    id: q.id,
    dataChannelIds: (q.items.filter(q => isDataChannelQueryItem(q)) as DataChannelList.DataChannel[]).map(u =>
      u.dataChannelId.localId.toString()
    ),
    subQueries: (q.items.filter(q => !isDataChannelQueryItem(q)) as Query[]).map(q => toQueryDto(q)),
    operator: operatorDto,
  };
};

const DEFAULT_QUERY: Query = { id: Date.now() + '', name: 'A', items: [] };
const DEFAULT_PANEL: Experiment = {
  id: 'Default',
  dataChannels: [],
  queryItemsExcludedFromGraph: new Set<string>(),
  queries: [DEFAULT_QUERY],
};
const DEFAULT_TIME_RANGE: RelativeTimeRange = { from: 900, to: 0 };
const DEFAULT_INTERVAL: string = '10s';

const ExperimentContextProvider = ({ children }: ExperimentContextProviderProps) => {
  const [interval, setInterval] = useLocalStorage<string>('vista-lab-interval', DEFAULT_INTERVAL);
  const [timeRange, setTimeRange] = useLocalStorage<RelativeTimeRange>('vista-lab-time-range', DEFAULT_TIME_RANGE);
  const { gmod, codebooks } = useVISContext();
  const { vessel, fleet } = useLabContext();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const serializer: LocalStorageSerializer<Experiment[]> | undefined = useMemo(() => {
    return {
      serialize: experiments => {
        const serializeableExperiments: SerializableExperiment[] = experiments.map(p => ({
          ...p,
          dataChannels: p.dataChannels.map(JSONExtensions.DataChannel.toJsonDto),
          queries: p.queries.map(q => ({
            ...q,
            items: q.items.map(item => {
              if (isDataChannelQueryItem(item)) return JSONExtensions.DataChannel.toJsonDto(item);
              return item.id;
            }),
          })),
          queryItemsExcludedFromGraph: Array.from(p.queryItemsExcludedFromGraph),
        }));

        return JSON.stringify(serializeableExperiments);
      },
      deserialize: async str => {
        if (!gmod || !codebooks) {
          return [DEFAULT_PANEL];
        }
        const deserializableExperiments = JSON.parse(str) as SerializableExperiment[];

        const deserializedExperiments: Experiment[] = [];

        for (let dp of deserializableExperiments) {
          const queriesWOItems = dp.queries.map(q => ({
            id: q.id,
            name: q.name,
            operator: q.operator,
          }));

          const dataChannels: DataChannelList.DataChannel[] = [];
          for (let dc of dp.dataChannels) {
            dataChannels.push(await JSONExtensions.DataChannel.toDomainModel(dc));
          }

          const queries: Query[] = [];
          for (let q of dp.queries) {
            const items: (Query | DataChannelList.DataChannel)[] = [];

            for (let item of q.items) {
              if (isString(item)) {
                const query = queriesWOItems.find(q => q.id === item);
                if (!query) throw new Error('Failed to find query with item: ' + item);
                items.push(query as Query);
                continue;
              } else {
                items.push(await JSONExtensions.DataChannel.toDomainModel(item));
                continue;
              }
            }

            queries.push({ ...q, items });
          }

          deserializedExperiments.push({
            ...dp,
            queries,
            dataChannels,
            queryItemsExcludedFromGraph: new Set<string>(dp.queryItemsExcludedFromGraph),
          });
        }

        return deserializedExperiments;
      },
    };
  }, [gmod, codebooks]);

  const [experiments, setExperiments] = useLocalStorage<Experiment[]>(
    'vista-experiments',
    [DEFAULT_PANEL],
    serializer
  );

  // Exposed callbacks
  const getExperiment = useCallback(
    (id: string) => {
      const p = experiments.find(p => p.id === id);
      if (!p) return DEFAULT_PANEL;

      return p;
    },
    [experiments]
  );

  const getTimeseriesDataForExperiment = useCallback(
    async (Experiment: Experiment) => {
      const tr: TimeRange = {
        from: Experiment.timeRange?.from ?? timeRange.from,
        to: Experiment.timeRange?.to ?? timeRange.to,
        interval: Experiment.interval ?? interval,
      };

      const toQueryDtoFromDataChannelId = (dataChannel: DataChannelList.DataChannel): QueryDto => {
        const localIdStr = dataChannel.dataChannelId.localId.toString();

        return {
          id: localIdStr,
          name: localIdStr,
          dataChannelIds: [localIdStr],
          operator: 0,
          subQueries: [],
        };
      };

      const data = {
        timeRange: tr,
        queries: Experiment.queries
          .filter(q => !Experiment.queryItemsExcludedFromGraph.has(q.id))
          .map(q => toQueryDto(q))
          .concat(
            ...Experiment.dataChannels
              .filter(d => !Experiment.queryItemsExcludedFromGraph.has(d.dataChannelId.localId.toString()))
              .map(toQueryDtoFromDataChannelId)
          )
          .filter(q => q.dataChannelIds?.length),
        vesselId: vessel.id,
      };

      return VistaLabApi.dataChannelGetTimeSeriesDataByQueries(data);
    },
    [interval, timeRange, vessel]
  );

  const addExperiment = useCallback(
    (id: string) => {
      setExperiments(prev => {
        if (prev.some(p => p.id === id)) {
          addToast(ToastType.Warning, 'Failed to create Experiment', <p>Duplicate id: {id}</p>);
          return prev;
        }
        return [...prev, { id, dataChannels: [], queryItemsExcludedFromGraph: new Set<string>(), queries: [] }];
      });
    },
    [setExperiments, addToast]
  );

  const renameExperiment = useCallback(
    (experimentId: string, name: string) => {
      setExperiments(prev => {
        const newExperiments = [...prev];
        const Experiment = newExperiments.find(p => p.id === experimentId);
        if (!Experiment) return prev;

        Experiment.id = name;
        return newExperiments;
      });
    },
    [setExperiments]
  );

  const editExperiment = useCallback(
    (Experiment: Experiment) => {
      setExperiments(prev => {
        const newExperiments = [...prev];
        const experimentIndex = newExperiments.findIndex(p => p.id === Experiment.id);
        if (experimentIndex === -1) return prev;

        newExperiments.splice(experimentIndex, 1, Experiment);
        return newExperiments;
      });
    },
    [setExperiments]
  );

  const deleteExperiment = useCallback(
    (id: string) => {
      setExperiments(prev => {
        const newExperiments = [...prev];
        const experimentIndex = newExperiments.findIndex(p => p.id === id);
        if (experimentIndex === -1) return prev;
        newExperiments.splice(experimentIndex, 1);
        return newExperiments;
      });
    },
    [setExperiments]
  );

  const addDataChannelToExperiment = useCallback(
    (experimentId: string, dataChannel: DataChannelList.DataChannel) => {
      setExperiments(experiments => {
        const newExperiments = [...experiments];
        const experimentIndex = newExperiments.findIndex(p => p.id === experimentId);
        if (experimentIndex === -1) {
          addToast(
            ToastType.Danger,
            'Failed to find Experiment',
            <p>Failed to find Experiment with id: {experimentId}</p>
          );
          return experiments;
        }

        const dataChannelEl = (
          <span style={{ fontSize: '0.75em' }}>
            <DataChannelCard
              dataChannel={dataChannel}
              mode={CardMode.LegacyNameCentric}
              extraNodes={<Icon icon={IconName.RightArrow} />}
            />
          </span>
        );

        const Experiment = { ...newExperiments[experimentIndex] };

        if (Experiment.dataChannels.some(d => d.dataChannelId.localId.equals(dataChannel.dataChannelId.localId))) {
          addToast(ToastType.Warning, 'Duplicate data channel', dataChannelEl);
          return experiments;
        }

        addToast(ToastType.Success, 'Data channel added', dataChannelEl, () =>
          navigate(RoutePath.ViewAndBuild + `/${experimentId}`)
        );

        Experiment.dataChannels = [...Experiment.dataChannels, dataChannel];
        newExperiments[experimentIndex] = Experiment;

        return newExperiments;
      });
    },
    [addToast, setExperiments, navigate]
  );

  const removeDataChannelFromExperiment = useCallback(
    (experimentId: string, dataChannel: DataChannelList.DataChannel) => {
      setExperiments(prev => {
        const newExperiments = [...prev];
        const experimentIndex = newExperiments.findIndex(p => p.id === experimentId);
        if (experimentIndex === -1) return prev;
        const Experiment = { ...newExperiments[experimentIndex] };
        const dataChannelIndex = Experiment.dataChannels.findIndex(d =>
          d.dataChannelId.localId.equals(dataChannel.dataChannelId.localId)
        );
        Experiment.dataChannels.splice(dataChannelIndex, 1);
        newExperiments[experimentIndex] = Experiment;
        return newExperiments;
      });
    },
    [setExperiments]
  );

  const toggleQueryItemInExperiment = useCallback(
    (experimentId: string, queryItem: DataChannelList.DataChannel | Query) => {
      setExperiments(prev => {
        const newExperiments = [...prev];
        const experimentIndex = newExperiments.findIndex(p => p.id === experimentId);
        if (experimentIndex === -1) return prev;
        const Experiment = { ...newExperiments[experimentIndex] };
        const key = isDataChannelQueryItem(queryItem) ? queryItem.dataChannelId.localId.toString() : queryItem.id;
        const isExcluded = Experiment.queryItemsExcludedFromGraph.has(key);
        if (isExcluded) Experiment.queryItemsExcludedFromGraph.delete(key);
        else Experiment.queryItemsExcludedFromGraph.add(key);
        newExperiments[experimentIndex] = Experiment;
        return newExperiments;
      });
    },
    [setExperiments]
  );

  const addNewQueryToExperiment = useCallback(
    (experimentId: string) => {
      setExperiments(experiments => {
        const newExperiments = [...experiments];
        const experimentIndex = newExperiments.findIndex(p => p.id === experimentId);
        if (experimentIndex === -1) {
          addToast(
            ToastType.Danger,
            'Failed to find Experiment',
            <p>Failed to find Experiment with id: {experimentId}</p>
          );
          return experiments;
        }

        const Experiment = { ...newExperiments[experimentIndex] };
        const query: Query = { ...DEFAULT_QUERY, id: Date.now() + '' };
        while (Experiment.queries.some(q => q.name === query.name)) {
          query.name = nextChar(query.name);
        }

        Experiment.queries = [...Experiment.queries, query];
        newExperiments[experimentIndex] = Experiment;

        return newExperiments;
      });
    },
    [setExperiments, addToast]
  );

  const removeQueryFromExperiment = useCallback(
    (experimentId: string, query: Query) => {
      setExperiments(prev => {
        const newExperiments = [...prev];
        const experimentIndex = newExperiments.findIndex(p => p.id === experimentId);
        if (experimentIndex === -1) return prev;
        const Experiment = { ...newExperiments[experimentIndex] };
        const queries = [...Experiment.queries];
        const queryIndex = queries.findIndex(q => q.id === query.id);
        queries.splice(queryIndex, 1);
        Experiment.queries = queries;
        newExperiments[experimentIndex] = Experiment;

        return newExperiments;
      });
    },
    [setExperiments]
  );
  const editQuery = useCallback(
    (experimentId: string, query: Query) => {
      setExperiments(prev => {
        const newExperiments = [...prev];
        const experimentIndex = newExperiments.findIndex(p => p.id === experimentId);
        if (experimentIndex === -1) return prev;
        const Experiment = { ...newExperiments[experimentIndex] };
        const queries = [...Experiment.queries];
        const queryIndex = queries.findIndex(q => q.id === query.id);
        queries.splice(queryIndex, 1, query);
        Experiment.queries = queries;
        newExperiments[experimentIndex] = Experiment;

        return newExperiments;
      });
    },
    [setExperiments]
  );

  const selectQueryItem = useCallback(
    (experimentId: string, queryId: string, item: Query | DataChannelList.DataChannel) => {
      setExperiments(prev => {
        const newExperiments = [...prev];
        const experimentIndex = newExperiments.findIndex(p => p.id === experimentId);
        if (experimentIndex === -1) return prev;
        const Experiment = { ...newExperiments[experimentIndex] };
        const queries = [...Experiment.queries];
        const query = queries.find(q => q.id === queryId);
        if (!query) return prev;

        query.items = [...query.items, item];

        Experiment.queries = queries;
        newExperiments[experimentIndex] = Experiment;

        return newExperiments;
      });
    },
    [setExperiments]
  );

  const selectQueryOperator = useCallback(
    (experimentId: string, queryId: string, operator: Operator) => {
      setExperiments(prev => {
        const newExperiments = [...prev];
        const experimentIndex = newExperiments.findIndex(p => p.id === experimentId);
        if (experimentIndex === -1) return prev;
        const Experiment = { ...newExperiments[experimentIndex] };
        const queries = [...Experiment.queries];
        const query = queries.find(q => q.id === queryId);
        if (!query) return prev;

        query.operator = operator;

        Experiment.queries = queries;
        newExperiments[experimentIndex] = Experiment;

        return newExperiments;
      });
    },
    [setExperiments]
  );

  const saveDataChannelFromQuery = useCallback(
    async (dataChannel: DataChannelList.DataChannel, query: Query) => {
      if (vessel.id === 'fleet') {
        for (let vessel of fleet.vessels) {
          await VistaLabApi.dataChannelSavesDataChannelFromQuery({
            dataChannel: JSONExtensions.DataChannel.toJsonDto(dataChannel) as unknown as DataChannel,
            query: toQueryDto(query),
            vessel: vessel.id,
            vesselName: vessel.name,
          });
        }
        return Promise.resolve();
      }
      return VistaLabApi.dataChannelSavesDataChannelFromQuery({
        dataChannel: JSONExtensions.DataChannel.toJsonDto(dataChannel) as unknown as DataChannel,
        query: toQueryDto(query),
        vessel: vessel.id,
        vesselName: vessel.name,
      });
    },
    [vessel, fleet]
  );

  return (
    <ExperimentContext.Provider
      value={{
        timeRange,
        getTimeseriesDataForExperiment,
        saveDataChannelFromQuery,
        setTimeRange,
        interval,
        setInterval,
        addDataChannelToExperiment,
        toggleQueryItemInExperiment,
        experiments,
        addExperiment,
        editExperiment,
        deleteExperiment,
        renameExperiment,
        removeDataChannelFromExperiment,
        getExperiment,
        addNewQueryToExperiment,
        removeQueryFromExperiment,
        editQuery,
        selectQueryItem,
        setExperiments,
        selectQueryOperator,
      }}
    >
      {children}
    </ExperimentContext.Provider>
  );
};

const useExperimentContext = () => {
  const context = React.useContext(ExperimentContext);
  if (context === undefined) {
    throw new Error('useExperimentContext must be used within a ExperimentContextProvider');
  }
  return context;
};

export { useExperimentContext, ExperimentContextProvider };
