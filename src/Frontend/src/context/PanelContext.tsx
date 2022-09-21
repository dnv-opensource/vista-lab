import { DataChannelList, DataChannelListDto, JSONExtensions } from 'dnv-vista-sdk';
import { isString } from 'lodash';
import React, { createContext, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { VistaLabApi } from '../apiConfig';
import { AggregatedQueryResult, Query as QueryDto, QueryOperator, TimeRange } from '../client';
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

export type PanelContextType = {
  panels: Panel[];
  addDataChannelToPanel: (panelId: string, dataChannel: DataChannelList.DataChannel) => void;
  removeDataChannelFromPanel: (panelId: string, dataChannel: DataChannelList.DataChannel) => void;
  toggleQueryItemInPanel: (panelId: string, item: DataChannelList.DataChannel | Query) => void;
  addNewQueryToPanel: (panelId: string) => void;
  removeQueryFromPanel: (panelId: string, query: Query) => void;
  editQuery: (panelId: string, query: Query) => void;
  setPanels: React.Dispatch<React.SetStateAction<Panel[]>>;
  addPanel: (id: string) => void;
  editPanel: (panel: Panel) => void;
  renamePanel: (panelId: string, name: string) => void;
  deletePanel: (id: string) => void;
  getPanel: (id: string) => Panel;
  selectQueryItem: (panelId: string, queryId: string, item: DataChannelList.DataChannel | Query) => void;
  selectQueryOperator: (panelId: string, queryId: string, operator: Operator) => void;
  timeRange: RelativeTimeRange;
  setTimeRange: React.Dispatch<React.SetStateAction<RelativeTimeRange>>;
  interval: string;
  setInterval: React.Dispatch<React.SetStateAction<string>>;
  getTimeseriesDataForPanel: (panel: Panel) => Promise<AggregatedQueryResult[]>;
};

type PanelContextProviderProps = React.PropsWithChildren<{}>;

const PanelContext = createContext<PanelContextType | undefined>(undefined);

export type Panel = {
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

type SerializablePanel = Omit<Panel, 'dataChannels' | 'queries' | 'queryItemsExcludedFromGraph'> & {
  queries: SerializableQuery[];
  dataChannels: DataChannelListDto.DataChannel[];
  queryItemsExcludedFromGraph: string[];
};

export function isDataChannelQueryItem(
  item: Query | DataChannelList.DataChannel
): item is DataChannelList.DataChannel {
  return 'dataChannelId' in item;
}

const DEFAULT_QUERY: Query = { id: Date.now() + '', name: 'A', items: [] };
const DEFAULT_PANEL: Panel = {
  id: 'Default',
  dataChannels: [],
  queryItemsExcludedFromGraph: new Set<string>(),
  queries: [DEFAULT_QUERY],
};
const DEFAULT_TIME_RANGE: RelativeTimeRange = { from: 900, to: 0 };
const DEFAULT_INTERVAL: string = '10s';

const PanelContextProvider = ({ children }: PanelContextProviderProps) => {
  const [interval, setInterval] = useLocalStorage<string>('vista-lab-interval', DEFAULT_INTERVAL);
  const [timeRange, setTimeRange] = useLocalStorage<RelativeTimeRange>('vista-lab-time-range', DEFAULT_TIME_RANGE);
  const { gmod, codebooks } = useVISContext();
  const { vessel } = useLabContext();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const serializer: LocalStorageSerializer<Panel[]> | undefined = useMemo(() => {
    return {
      serialize: panels => {
        const serializeablePanels: SerializablePanel[] = panels.map(p => ({
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

        return JSON.stringify(serializeablePanels);
      },
      deserialize: async str => {
        if (!gmod || !codebooks) {
          return [DEFAULT_PANEL];
        }
        const deserializablePanels = JSON.parse(str) as SerializablePanel[];

        const deserializedPanels: Panel[] = [];

        for (let dp of deserializablePanels) {
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

          deserializedPanels.push({
            ...dp,
            queries,
            dataChannels,
            queryItemsExcludedFromGraph: new Set<string>(dp.queryItemsExcludedFromGraph),
          });
        }

        return deserializedPanels;
      },
    };
  }, [gmod, codebooks]);

  const [panels, setPanels] = useLocalStorage<Panel[]>('vista-panels', [DEFAULT_PANEL], serializer);

  // Exposed callbacks
  const getPanel = useCallback(
    (id: string) => {
      const p = panels.find(p => p.id === id);
      if (!p) return DEFAULT_PANEL;

      return p;
    },
    [panels]
  );

  const getTimeseriesDataForPanel = useCallback(
    async (panel: Panel) => {
      const tr: TimeRange = {
        from: panel.timeRange?.from ?? timeRange.from,
        to: panel.timeRange?.to ?? timeRange.to,
        interval: panel.interval ?? interval,
      };

      const toQueryDto = (q: Query): QueryDto => {
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
          vesselId: vessel.id,
        };
      };

      const toQueryDtoFromDataChannelId = (dataChannel: DataChannelList.DataChannel): QueryDto => {
        const localIdStr = dataChannel.dataChannelId.localId.toString();

        return {
          id: localIdStr,
          name: localIdStr,
          dataChannelIds: [localIdStr],
          operator: 0,
          subQueries: [],
          vesselId: vessel.id,
        };
      };

      const data = {
        timeRange: tr,
        queries: panel.queries
          .filter(q => !panel.queryItemsExcludedFromGraph.has(q.id))
          .map(q => toQueryDto(q))
          .concat(
            ...panel.dataChannels
              .filter(d => !panel.queryItemsExcludedFromGraph.has(d.dataChannelId.localId.toString()))
              .map(toQueryDtoFromDataChannelId)
          )
          .filter(q => q.dataChannelIds?.length),
      };

      return VistaLabApi.dataChannelGetTimeSeriesDataByQueries(data);
    },
    [interval, timeRange, vessel]
  );

  const addPanel = useCallback(
    (id: string) => {
      setPanels(prev => {
        if (prev.some(p => p.id === id)) {
          addToast(ToastType.Warning, 'Failed to create panel', <p>Duplicate id: {id}</p>);
          return prev;
        }
        return [...prev, { id, dataChannels: [], queryItemsExcludedFromGraph: new Set<string>(), queries: [] }];
      });
    },
    [setPanels, addToast]
  );

  const renamePanel = useCallback(
    (panelId: string, name: string) => {
      setPanels(prev => {
        const newPanels = [...prev];
        const panel = newPanels.find(p => p.id === panelId);
        if (!panel) return prev;

        panel.id = name;
        return newPanels;
      });
    },
    [setPanels]
  );

  const editPanel = useCallback(
    (panel: Panel) => {
      setPanels(prev => {
        const newPanels = [...prev];
        const panelIndex = newPanels.findIndex(p => p.id === panel.id);
        if (panelIndex === -1) return prev;

        newPanels.splice(panelIndex, 1, panel);
        return newPanels;
      });
    },
    [setPanels]
  );

  const deletePanel = useCallback(
    (id: string) => {
      setPanels(prev => {
        const newPanels = [...prev];
        const panelIndex = newPanels.findIndex(p => p.id === id);
        if (panelIndex === -1) return prev;
        newPanels.splice(panelIndex, 1);
        return newPanels;
      });
    },
    [setPanels]
  );

  const addDataChannelToPanel = useCallback(
    (panelId: string, dataChannel: DataChannelList.DataChannel) => {
      setPanels(panels => {
        const newPanels = [...panels];
        const panelIndex = newPanels.findIndex(p => p.id === panelId);
        if (panelIndex === -1) {
          addToast(ToastType.Danger, 'Failed to find panel', <p>Failed to find panel with id: {panelId}</p>);
          return panels;
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

        const panel = { ...newPanels[panelIndex] };
        if (panel.dataChannels.some(d => d.dataChannelId.localId.equals(dataChannel.dataChannelId.localId))) {
          addToast(ToastType.Warning, 'Duplicate data channel', dataChannelEl);
          return panels;
        }

        addToast(ToastType.Success, 'Data channel added', dataChannelEl, () =>
          navigate(RoutePath.ViewAndBuild + `/${panelId}`)
        );

        panel.dataChannels = [...panel.dataChannels, dataChannel];
        newPanels[panelIndex] = panel;

        return newPanels;
      });
    },
    [addToast, setPanels, navigate]
  );

  const removeDataChannelFromPanel = useCallback(
    (panelId: string, dataChannel: DataChannelList.DataChannel) => {
      setPanels(prev => {
        const newPanels = [...prev];
        const panelIndex = newPanels.findIndex(p => p.id === panelId);
        if (panelIndex === -1) return prev;
        const panel = { ...newPanels[panelIndex] };
        const dataChannelIndex = panel.dataChannels.findIndex(d =>
          d.dataChannelId.localId.equals(dataChannel.dataChannelId.localId)
        );
        panel.dataChannels.splice(dataChannelIndex, 1);
        newPanels[panelIndex] = panel;
        return newPanels;
      });
    },
    [setPanels]
  );

  const toggleQueryItemInPanel = useCallback(
    (panelId: string, queryItem: DataChannelList.DataChannel | Query) => {
      setPanels(prev => {
        const newPanels = [...prev];
        const panelIndex = newPanels.findIndex(p => p.id === panelId);
        if (panelIndex === -1) return prev;
        const panel = { ...newPanels[panelIndex] };
        const key = isDataChannelQueryItem(queryItem) ? queryItem.dataChannelId.localId.toString() : queryItem.id;
        const isExcluded = panel.queryItemsExcludedFromGraph.has(key);
        if (isExcluded) panel.queryItemsExcludedFromGraph.delete(key);
        else panel.queryItemsExcludedFromGraph.add(key);
        newPanels[panelIndex] = panel;
        return newPanels;
      });
    },
    [setPanels]
  );

  const addNewQueryToPanel = useCallback(
    (panelId: string) => {
      setPanels(panels => {
        const newPanels = [...panels];
        const panelIndex = newPanels.findIndex(p => p.id === panelId);
        if (panelIndex === -1) {
          addToast(ToastType.Danger, 'Failed to find panel', <p>Failed to find panel with id: {panelId}</p>);
          return panels;
        }

        const panel = { ...newPanels[panelIndex] };
        const query: Query = { ...DEFAULT_QUERY, id: Date.now() + '' };
        while (panel.queries.some(q => q.name === query.name)) {
          query.name = nextChar(query.name);
        }

        panel.queries = [...panel.queries, query];
        newPanels[panelIndex] = panel;

        return newPanels;
      });
    },
    [setPanels, addToast]
  );

  const removeQueryFromPanel = useCallback(
    (panelId: string, query: Query) => {
      setPanels(prev => {
        const newPanels = [...prev];
        const panelIndex = newPanels.findIndex(p => p.id === panelId);
        if (panelIndex === -1) return prev;
        const panel = { ...newPanels[panelIndex] };
        const queries = [...panel.queries];
        const queryIndex = queries.findIndex(q => q.id === query.id);
        queries.splice(queryIndex, 1);
        panel.queries = queries;
        newPanels[panelIndex] = panel;

        return newPanels;
      });
    },
    [setPanels]
  );
  const editQuery = useCallback(
    (panelId: string, query: Query) => {
      setPanels(prev => {
        const newPanels = [...prev];
        const panelIndex = newPanels.findIndex(p => p.id === panelId);
        if (panelIndex === -1) return prev;
        const panel = { ...newPanels[panelIndex] };
        const queries = [...panel.queries];
        const queryIndex = queries.findIndex(q => q.id === query.id);
        queries.splice(queryIndex, 1, query);
        panel.queries = queries;
        newPanels[panelIndex] = panel;

        return newPanels;
      });
    },
    [setPanels]
  );

  const selectQueryItem = useCallback(
    (panelId: string, queryId: string, item: Query | DataChannelList.DataChannel) => {
      setPanels(prev => {
        const newPanels = [...prev];
        const panelIndex = newPanels.findIndex(p => p.id === panelId);
        if (panelIndex === -1) return prev;
        const panel = { ...newPanels[panelIndex] };
        const queries = [...panel.queries];
        const query = queries.find(q => q.id === queryId);
        if (!query) return prev;

        query.items = [...query.items, item];

        panel.queries = queries;
        newPanels[panelIndex] = panel;

        return newPanels;
      });
    },
    [setPanels]
  );

  const selectQueryOperator = useCallback(
    (panelId: string, queryId: string, operator: Operator) => {
      setPanels(prev => {
        const newPanels = [...prev];
        const panelIndex = newPanels.findIndex(p => p.id === panelId);
        if (panelIndex === -1) return prev;
        const panel = { ...newPanels[panelIndex] };
        const queries = [...panel.queries];
        const query = queries.find(q => q.id === queryId);
        if (!query) return prev;

        query.operator = operator;

        panel.queries = queries;
        newPanels[panelIndex] = panel;

        return newPanels;
      });
    },
    [setPanels]
  );

  return (
    <PanelContext.Provider
      value={{
        timeRange,
        getTimeseriesDataForPanel,
        setTimeRange,
        interval,
        setInterval,
        addDataChannelToPanel,
        toggleQueryItemInPanel,
        panels,
        addPanel,
        editPanel,
        deletePanel,
        renamePanel,
        removeDataChannelFromPanel,
        getPanel,
        addNewQueryToPanel,
        removeQueryFromPanel,
        editQuery,
        selectQueryItem,
        setPanels,
        selectQueryOperator,
      }}
    >
      {children}
    </PanelContext.Provider>
  );
};

const usePanelContext = () => {
  const context = React.useContext(PanelContext);
  if (context === undefined) {
    throw new Error('usePanelContext must be used within a PanelContextProvider');
  }
  return context;
};

export { usePanelContext, PanelContextProvider };
