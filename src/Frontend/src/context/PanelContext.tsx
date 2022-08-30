import { UniversalId, UniversalIdBuilder } from 'dnv-vista-sdk';
import _ from 'lodash';
import React, { createContext, useCallback, useMemo } from 'react';
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
  deletePanel: (id: string) => void;
  getPanel: (id: string) => Panel;
  selectQueryItem: (panelId: string, queryId: string, item: UniversalId | Query) => void;
  selectQueryOperator: (panelId: string, queryId: string, operator: Operator) => void;
};

type PanelContextProviderProps = React.PropsWithChildren<{}>;

const PanelContext = createContext<PanelContextType | undefined>(undefined);

export type Query = {
  id: string;
  name: string;
  operator?: Operator;
  items: (UniversalId | Query)[];
  range: RelativeTimeRange;
};

export type Panel = {
  queries: Query[];
  dataChannelIds: UniversalId[];
  id: string;
};

type SerializableQuery = Omit<Query, 'items'> & {
  items: string[];
};

type SerializablePanel = {
  queries: SerializableQuery[];
  dataChannelIds: string[];
  id: string;
};

const DEFAULT_QUERY: Query = { id: _.uniqueId(), name: 'A', items: [], range: { from: 900, to: 0 } };
const DEFAULT_PANEL: Panel = { id: 'Default', dataChannelIds: [], queries: [DEFAULT_QUERY] };

const PanelContextProvider = ({ children }: PanelContextProviderProps) => {
  const { gmod, codebooks } = useVISContext();
  const { addToast } = useToast();

  const serializer: LocalStorageSerializer<Panel[]> | undefined = useMemo(() => {
    return {
      serialize: panels => {
        const serializeablePanels: SerializablePanel[] = panels.map(p => ({
          id: p.id,
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
            id: dp.id,
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

        const query: Query = { ...DEFAULT_QUERY, id: _.uniqueId() };
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
        addDataChannelToPanel,
        panels,
        addPanel,
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
