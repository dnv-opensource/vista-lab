import {
  DataChannelList,
  DataChannelListDto,
  GmodPath,
  JSONExtensions,
  LocalId,
  Pmod,
  VisVersion,
} from 'dnv-vista-sdk';
import React, { createContext, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { VistaLabApi } from '../apiConfig';
import { VesselMode } from '../pages/shared/vmod/Vmod';
import { useLabContext } from './LabContext';
import { useVISContext } from './VISContext';

export type SearchContextType = {
  fetchFilteredDataChannels: (query?: string) => Promise<DataChannelList.DataChannelListPackage[]>;
  getVmodForVessel: (vesselIds: string[]) => Promise<Pmod | undefined>;
  getDataChannelsFromGmodPath: (path: GmodPath, vesselId?: string) => DataChannelList.DataChannel[];
  mode: VesselMode;
  setMode: (value: VesselMode) => void;
};

type SearchContextProviderProps = React.PropsWithChildren<{}>;

const SearchContext = createContext<SearchContextType | undefined>(undefined);

const SearchContextProvider = ({ children }: SearchContextProviderProps) => {
  const { visVersion } = useVISContext();
  const { vessel, dataChannelListPackages } = useLabContext();
  const [searchParams, setSearchParam] = useSearchParams();

  const mode: VesselMode = useMemo(
    () => (searchParams.get('mode') as VesselMode | null) ?? VesselMode.Any,
    [searchParams]
  );
  const setMode = useCallback(
    (value: VesselMode) => {
      const current = new URLSearchParams(window.location.search);
      current.set('mode', value);
      setSearchParam(current);
    },
    [setSearchParam]
  );

  const fetchFilteredDataChannels = useCallback(
    async (query?: string): Promise<DataChannelList.DataChannelListPackage[]> => {
      const clientVersion = Object.values(VisVersion).indexOf(visVersion);

      if (clientVersion === -1) throw new Error('SearchContext: Invalid VisVersion');

      const scope = {
        [VesselMode.Any]: 0,
        [VesselMode.PrimaryItem]: 1,
        [VesselMode.SecondaryItem]: 2,
      }[mode];

      const response = await VistaLabApi.searchSearch(clientVersion, {
        vesselId: vessel.id === 'fleet' ? undefined : vessel.id,
        scope: scope,
        phrase: query ?? '',
      });

      const domainResponse: DataChannelList.DataChannelListPackage[] = [];

      for (let dclp of response) {
        domainResponse.push(
          await JSONExtensions.DataChannelList.toDomainModel(
            dclp as unknown as DataChannelListDto.DataChannelListPackage
          )
        );
      }

      return domainResponse;
    },
    [mode, visVersion, vessel]
  );

  const getVmodForVessel = useCallback(
    async (vesselIds: string[]): Promise<Pmod | undefined> => {
      const localIdMap: Map<string, LocalId> = new Map();

      for (const vesselId of vesselIds) {
        const dclp = dataChannelListPackages?.find(
          dclp => dclp.package?.header?.shipId.toString() === vesselId
        )?.package;
        if (!dclp) return;

        const dataChannels = dclp?.dataChannelList?.dataChannel;
        if (!dataChannels || dataChannels.length === 0 || !dclp.header?.dataChannelListId?.version) return;

        for (const dc of dclp.dataChannelList?.dataChannel) {
          const localIdStr = dc.dataChannelId.localId.toString();
          if (!localIdMap.has(localIdStr)) {
            localIdMap.set(localIdStr, dc.dataChannelId.localId);
          }
        }
      }
      const localIds = [...localIdMap.values()];
      let pmod: Pmod | undefined = undefined;
      if (localIds.length > 0) {
        if (mode === VesselMode.Any) {
          pmod = Pmod.createFromLocalIds(visVersion, localIds);
        } else {
          const paths =
            mode === VesselMode.PrimaryItem
              ? localIds.map(i => i.primaryItem as GmodPath)
              : localIds.filter(i => i.secondaryItem).map(i => i.secondaryItem as GmodPath);

          pmod = Pmod.createFromPaths(visVersion, paths);
        }
      }

      return localIds && pmod;
    },
    [dataChannelListPackages, mode, visVersion]
  );

  const getDataChannelsFromGmodPath = useCallback(
    (path: GmodPath, vesselId?: string): DataChannelList.DataChannel[] => {
      const channels =
        (vesselId
          ? dataChannelListPackages?.find(p => p.package.header.shipId.toString() === vesselId)?.package
              .dataChannelList.dataChannel
          : dataChannelListPackages?.flatMap(dclp => dclp.package.dataChannelList.dataChannel)) || [];

      return channels.filter(dc => {
        const localId = dc.dataChannelId.localId;
        const items: (GmodPath | undefined)[] = [];
        switch (mode) {
          case VesselMode.PrimaryItem:
            items.push(localId.primaryItem);
            break;
          case VesselMode.SecondaryItem:
            items.push(localId.secondaryItem);
            break;
          default:
            items.push(...[localId.primaryItem, localId.secondaryItem]);
            break;
        }
        for (const item of items) {
          if (item?.equals(path)) return true;
        }
        return false;
      });
    },
    [dataChannelListPackages, mode]
  );

  return (
    <SearchContext.Provider
      value={{
        fetchFilteredDataChannels,
        getVmodForVessel,
        getDataChannelsFromGmodPath,
        mode,
        setMode,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

const useSearchContext = () => {
  const context = React.useContext(SearchContext);
  if (context === undefined) {
    throw new Error('usSearchContext must be used within a SearchContextProvider');
  }
  return context;
};

export { useSearchContext, SearchContextProvider };
