import { GmodPath, Pmod, UniversalId, VisVersion } from 'dnv-vista-sdk';
import React, { createContext, useCallback, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { VistaLabApi } from '../apiConfig';
import { DataChannel, DataChannelListPackage, Property } from '../client';
import { VesselMode } from '../pages/shared/vessel/Vessel';
import { useVISContext } from './VISContext';

export type ExploreContextType = {
  dataChannelListPackages?: DataChannelListPackage[];
  setDataChannelListPackages: React.Dispatch<React.SetStateAction<DataChannelListPackage[] | undefined>>;
  fetchFilteredDataChannels: (query?: string) => Promise<DataChannelListPackage[]>;
  getVmodForVessel: (vesselId: string) => Promise<Pmod | undefined>;
  getUniversalIdsFromGmodPath: (path: GmodPath) => UniversalId[];
  getDataChannelsFromGmodPath: (path: GmodPath, vesselId?: string) => DataChannelWithShipData[];
  universalIds: UniversalId[] | undefined;
  mode: VesselMode;
  setMode: (value: VesselMode) => void;
  postImportAndSimulateDataChannelFile: (file: File) => void;
};

type ExploreContextProviderProps = React.PropsWithChildren<{}>;

const ExploreContext = createContext<ExploreContextType | undefined>(undefined);

export type DataChannelWithShipData = DataChannel & {
  Property: Property & { ShipID: string; UniversalID: UniversalId };
};

const ExploreContextProvider = ({ children }: ExploreContextProviderProps) => {
  const [universalIds, setUniversalIds] = useState<UniversalId[]>();
  const { visVersion } = useVISContext();
  const [dataChannelListPackages, setDataChannelListPackages] = useState<DataChannelListPackage[]>();
  const [searchParams, setSearchParam] = useSearchParams();
  const { vesselId } = useParams();
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
    async (query?: string) => {
      const clientVersion = Object.values(VisVersion).indexOf(visVersion);

      if (clientVersion === -1) throw new Error('ExploreContext: Invalid VisVersion');

      const scope = {
        [VesselMode.Any]: 0,
        [VesselMode.PrimaryItem]: 1,
        [VesselMode.SecondaryItem]: 2,
      }[mode];

      const response = await VistaLabApi.searchSearch(clientVersion, {
        vesselId: vesselId === 'all' ? undefined : vesselId,
        scope: scope,
        phrase: query ?? '',
      });

      return response;
    },
    [mode, visVersion, vesselId]
  );

  const getVmodForVessel = useCallback(
    async (vesselId: string): Promise<Pmod | undefined> => {
      const dclp = dataChannelListPackages?.find(dclp => dclp.Package?.Header?.ShipID === vesselId)?.Package;
      if (!dclp) return;

      const dataChannels = dclp?.DataChannelList?.DataChannel;
      if (!dataChannels || dataChannels.length === 0 || !dclp.Header?.DataChannelListID?.Version) return;

      const universalIds = dclp.DataChannelList?.DataChannel?.map(
        dc => (dc as DataChannelWithShipData).Property.UniversalID
      );

      let pmod: Pmod | undefined = undefined;
      if (universalIds) {
        setUniversalIds(universalIds);
        if (mode === VesselMode.Any) {
          pmod = Pmod.createFromLocalIds(
            visVersion,
            universalIds.map(u => u.localId)
          );
        } else {
          const paths =
            mode === VesselMode.PrimaryItem
              ? universalIds.map(i => i.localId.primaryItem as GmodPath)
              : universalIds.filter(i => i.localId.secondaryItem).map(i => i.localId.secondaryItem as GmodPath);

          pmod = Pmod.createFromPaths(visVersion, paths);
        }
      }

      return universalIds && pmod;
    },
    [dataChannelListPackages, mode, visVersion]
  );

  const getUniversalIdsFromGmodPath = useCallback(
    (path: GmodPath): UniversalId[] => {
      return (
        universalIds?.filter(universalId => {
          const localId = universalId.localId;
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
        }) ?? []
      );
    },
    [universalIds, mode]
  );

  const getDataChannelsFromGmodPath = useCallback(
    (path: GmodPath, vesselId?: string): DataChannelWithShipData[] => {
      const channels = ((vesselId
        ? dataChannelListPackages?.find(p => p.Package.Header.ShipID === vesselId)?.Package.DataChannelList.DataChannel
        : dataChannelListPackages?.flatMap(dclp => dclp.Package.DataChannelList.DataChannel)) ||
        []) as DataChannelWithShipData[];

      return channels.filter(dc => {
        const universalId: UniversalId = (dc as DataChannelWithShipData).Property.UniversalID;
        const localId = universalId.localId;
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

  const postImportAndSimulateDataChannelFile = (file: File) => {
    fetch('http://localhost:5054/api/data-channel/import-and-simulate', {
      method: 'POST',
      body: file,
    });
  };

  return (
    <ExploreContext.Provider
      value={{
        dataChannelListPackages,
        setDataChannelListPackages,
        fetchFilteredDataChannels,
        getVmodForVessel,
        getUniversalIdsFromGmodPath,
        getDataChannelsFromGmodPath,
        universalIds,
        mode,
        setMode,
        postImportAndSimulateDataChannelFile,
      }}
    >
      {children}
    </ExploreContext.Provider>
  );
};

const useExploreContext = () => {
  const context = React.useContext(ExploreContext);
  if (context === undefined) {
    throw new Error('useExploreContext must be used within a ExploreContextProvider');
  }
  return context;
};

export { useExploreContext, ExploreContextProvider };
