import { UniversalId, UniversalIdBuilder } from 'dnv-vista-sdk';
import React, { createContext, useCallback, useMemo } from 'react';
import { VistaLabApi } from '../apiConfig';
import { TimeRange, QueryOperator, Query as QueryDto, AggregatedQueryResult } from '../client';
import { Operator } from '../components/monitor/query-generator/operator-selection/OperatorSelection';
import { RelativeTimeRange } from '../components/ui/time-pickers/relative-time-range-picker/types';
import useLocalStorage, { LocalStorageSerializer } from '../hooks/use-localstorage';
import useToast, { ToastType } from '../hooks/use-toast';
import { nextChar } from '../util/string';
import { useVISContext } from './VISContext';

export type PanelContextType = {
  panels: Panel[];
  addDataChannelToPanel: (panelId: string, dataChannel: UniversalId) => void;
  removeDataChannelFromPanel: (panelId: string, dataChannel: UniversalId) => void;
  addNewQueryToPanel: (panelId: string) => void;
  removeQueryFromPanel: (panelId: string, query: Query) => void;
  editQuery: (panelId: string, query: Query) => void;
  setPanels: React.Dispatch<React.SetStateAction<Panel[]>>;
  addPanel: (id: string) => void;
  editPanel: (panel: Panel) => void;
  deletePanel: (id: string) => void;
  getPanel: (id: string) => Panel;
  selectQueryItem: (panelId: string, queryId: string, item: UniversalId | Query) => void;
  selectQueryOperator: (panelId: string, queryId: string, operator: Operator) => void;
  timeRange: RelativeTimeRange;
  setTimeRange: React.Dispatch<React.SetStateAction<RelativeTimeRange>>;
  interval: string;
  setInterval: React.Dispatch<React.SetStateAction<string>>;
  getTimeseriesDataForPanel: (panel: Panel) => Promise<AggregatedQueryResult[]>;
};

type PanelContextProviderProps = React.PropsWithChildren<{}>;

const PanelContext = createContext<PanelContextType | undefined>(undefined);

export type Query = {
  id: string;
  name: string;
  operator?: Operator;
  items: (Query | UniversalId)[];
};

export type Panel = {
  queries: Query[];
  dataChannelIds: UniversalId[];
  id: string;
  timeRange?: RelativeTimeRange;
  interval?: string;
};

export type SerializableQuery = Omit<Query, 'items'> & {
  items: string[];
};

export type SerializablePanel = Omit<Panel, 'dataChannelIds' | 'queries'> & {
  queries: SerializableQuery[];
  dataChannelIds: string[];
};

const DEFAULT_QUERY: Query = { id: Date.now() + '', name: 'A', items: [] };
const DEFAULT_PANEL: Panel = { id: 'Default', dataChannelIds: [], queries: [DEFAULT_QUERY] };
const DEFAULT_TIME_RANGE: RelativeTimeRange = { from: 900, to: 0 };
const DEFAULT_INTERVAL: string = '10s';

const PanelContextProvider = ({ children }: PanelContextProviderProps) => {
  const [interval, setInterval] = useLocalStorage<string>('vista-lab-interval', DEFAULT_INTERVAL);
  const [timeRange, setTimeRange] = useLocalStorage<RelativeTimeRange>('vista-lab-time-range', DEFAULT_TIME_RANGE);
  const { gmod, codebooks } = useVISContext();
  const { addToast } = useToast();

  const serializer: LocalStorageSerializer<Panel[]> | undefined = useMemo(() => {
    return {
      serialize: panels => {
        const serializeablePanels: SerializablePanel[] = panels.map(p => ({
          ...p,
          dataChannelIds: p.dataChannelIds.map(l => l.toString()),
          queries: p.queries.map(q => ({
            ...q,
            items: q.items.map(item => {
              if ('localId' in item) return item.toString();
              return item.id;
            }),
          })),
        }));

        return JSON.stringify(serializeablePanels);
      },
      deserialize: str => {
        if (!gmod || !codebooks) {
          return [DEFAULT_PANEL];
        }
        const deserializablePanels = JSON.parse(str) as SerializablePanel[];

        const deserializedPanels = deserializablePanels.map(dp => {
          const queriesWOItems = dp.queries.map(q => ({
            id: q.id,
            name: q.name,
            operator: q.operator,
          }));

          const queries = dp.queries.map(q => ({
            ...q,
            items: q.items.map(item => {
              const universalId = UniversalIdBuilder.tryParse(item, gmod, codebooks);
              if (universalId) return universalId;
              const query = queriesWOItems.find(q => q.id === item);
              if (!query) throw new Error('Failed to find query with item: ' + item);
              return query;
            }),
          })) as Query[];

          return {
            ...dp,
            queries,
            dataChannelIds: dp.dataChannelIds.map(idStr => UniversalId.parse(idStr, gmod, codebooks)),
          } as Panel;
        });

        return deserializedPanels;
      },
    };
  }, [gmod, codebooks]);

  const [panels, setPanels] = useLocalStorage<Panel[]>('vista-panels', [DEFAULT_PANEL], serializer);

  // Exposed callbacks
  const getPanel = useCallback(
    (id: string) => {
      const p = panels.find(p => p.id === id);
      if (!p) throw new Error('Failed to find panel with id: ' + id);

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
        const operatorDto: QueryOperator = Object.entries(QueryOperator).find(
          ([key, _]) =>
            key === Object.keys(Operator)[Object.values(Operator).indexOf(q.operator as unknown as Operator)]
        )?.[1] as QueryOperator;
        return {
          id: q.id,
          name: q.name,
          dataChannelIds: (q.items.filter(q => 'localId' in q) as UniversalId[]).map(u => u.toString()),
          subQueries: (q.items.filter(q => 'items' in q) as Query[]).map(q => toQueryDto(q)),
          operator: operatorDto,
        };
      };

      const data = {
        timeRange: tr,
        queries: panel.queries.map(q => toQueryDto(q)),
      };

      return VistaLabApi.dataChannelGetTimeSeriesDataByQueries(data);
    },
    [interval, timeRange]
  );

  const addPanel = useCallback(
    (id: string) => {
      setPanels(prev => {
        if (prev.some(p => p.id === id)) {
          addToast(ToastType.Warning, 'Failed to create panel', <p>Duplicate id: {id}</p>);
          return prev;
        }
        return [...prev, { id, dataChannelIds: [], queries: [] }];
      });
    },
    [setPanels, addToast]
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
    (panelId: string, dataChannelId: UniversalId) => {
      setPanels(panels => {
        const newPanels = [...panels];
        const panel = newPanels.find(p => p.id === panelId);
        if (!panel) {
          addToast(ToastType.Danger, 'Failed to find panel', <p>Failed to find panel with id: {panelId}</p>);
          return panels;
        }

        if (panel.dataChannelIds.some(d => d.equals(dataChannelId))) {
          addToast(ToastType.Warning, 'Duplicate data channel', <p>{dataChannelId.toString()}</p>);
          return panels;
        }

        addToast(ToastType.Success, 'DataChannel added', <p>{dataChannelId.toString()}</p>);

        panel.dataChannelIds = [...panel.dataChannelIds, dataChannelId];

        return newPanels;
      });
    },
    [addToast, setPanels]
  );

  const removeDataChannelFromPanel = useCallback(
    (panelId: string, dataChannel: UniversalId) => {
      setPanels(prev => {
        const newPanels = [...prev];
        const panel = newPanels.find(p => p.id === panelId);
        if (!panel) return prev;
        const dataChannelIndex = panel.dataChannelIds.findIndex(d => d.equals(dataChannel));
        panel.dataChannelIds.splice(dataChannelIndex, 1);
        return newPanels;
      });
    },
    [setPanels]
  );

  const addNewQueryToPanel = useCallback(
    (panelId: string) => {
      setPanels(panels => {
        const newPanels = [...panels];
        const panel = newPanels.find(p => p.id === panelId);
        if (!panel) {
          addToast(ToastType.Danger, 'Failed to find panel', <p>Failed to find panel with id: {panelId}</p>);
          return panels;
        }

        const query: Query = { ...DEFAULT_QUERY, id: Date.now() + '' };
        while (panel.queries.some(q => q.name === query.name)) {
          query.name = nextChar(query.name);
        }

        panel.queries = [...panel.queries, query];

        return newPanels;
      });
    },
    [setPanels, addToast]
  );

  const removeQueryFromPanel = useCallback(
    (panelId: string, query: Query) => {
      setPanels(prev => {
        const newPanels = [...prev];
        const panel = newPanels.find(p => p.id === panelId);
        if (!panel) return prev;
        const queries = [...panel.queries];
        const queryIndex = queries.findIndex(q => q.id === query.id);
        queries.splice(queryIndex, 1);
        panel.queries = queries;
        return newPanels;
      });
    },
    [setPanels]
  );
  const editQuery = useCallback(
    (panelId: string, query: Query) => {
      setPanels(panels => {
        const newPanels = [...panels];
        const panel = newPanels.find(p => p.id === panelId);
        if (!panel) return panels;
        const queries = [...panel.queries];
        const queryIndex = queries.findIndex(q => q.id === query.id);
        queries.splice(queryIndex, 1, query);
        panel.queries = queries;
        return newPanels;
      });
    },
    [setPanels]
  );

  const selectQueryItem = useCallback(
    (panelId: string, queryId: string, item: Query | UniversalId) => {
      setPanels(panels => {
        const newPanels = [...panels];
        const panel = newPanels.find(p => p.id === panelId);
        if (!panel) return panels;
        const queries = [...panel.queries];
        const query = queries.find(q => q.id === queryId);
        if (!query) return panels;

        query.items = [...query.items, item];

        panel.queries = queries;

        return newPanels;
      });
    },
    [setPanels]
  );

  const selectQueryOperator = useCallback(
    (panelId: string, queryId: string, operator: Operator) => {
      setPanels(panels => {
        const newPanels = [...panels];
        const panel = newPanels.find(p => p.id === panelId);
        if (!panel) return panels;
        const queries = [...panel.queries];
        const query = queries.find(q => q.id === queryId);
        if (!query) return panels;

        query.operator = operator;

        panel.queries = queries;

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
        panels,
        addPanel,
        editPanel,
        deletePanel,
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
