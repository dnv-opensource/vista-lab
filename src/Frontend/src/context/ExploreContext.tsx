import { GmodPath, LocalId, Pmod, VIS, VisVersion } from 'dnv-vista-sdk';
import React, { createContext, useCallback, useState } from 'react';
import { VistaLabApi } from '../apiConfig';
import { DataChannelListPackage } from '../client/models/DataChannelListPackage';
import { VesselMode } from '../pages/explore/vessel/Vessel';
import { useVISContext } from './VISContext';

export type ExploreContextType = {
  dataChannelListPackages?: DataChannelListPackage[];
  setDataChannelListPackages: React.Dispatch<React.SetStateAction<DataChannelListPackage[] | undefined>>;
  fetchFilteredDataChannels: (query?: string) => Promise<DataChannelListPackage[]>;
  getVmodForVessel: (vesselId?: string) => Promise<Pmod | undefined>;
  getLocalIdsFromGmodPath: (path: GmodPath) => LocalId[];
  localIds: LocalId[] | undefined;
  mode: VesselMode;
  setMode: React.Dispatch<React.SetStateAction<VesselMode>>;
};

type ExploreContextProviderProps = React.PropsWithChildren<{}>;

const ExploreContext = createContext<ExploreContextType | undefined>(undefined);

const ExploreContextProvider = ({ children }: ExploreContextProviderProps) => {
  const [localIds, setLocalIds] = useState<LocalId[]>();
  const { visVersion } = useVISContext();
  const [dataChannelListPackages, setDataChannelListPackages] = useState<DataChannelListPackage[]>();
  const [mode, setMode] = useState<VesselMode>(VesselMode.All);

  const fetchFilteredDataChannels = useCallback(
    async (query?: string) => {
      const clientVersion = Object.values(VisVersion).indexOf(visVersion);

      if (clientVersion === -1) throw new Error('ExploreContext: Invalid VisVersion');

      const request = {
        visVersion: clientVersion,
        searchRequestDto: { scope: +mode, phrase: query ?? '' },
      };
      const response = await VistaLabApi.SearchApi.searchSearch(request);

      return response;
    },
    [mode, visVersion]
  );

  const getVmodForVessel = useCallback(
    async (vesselId?: string): Promise<Pmod | undefined> => {
      const dclp = dataChannelListPackages?.find(dclp => dclp._package?.header?.shipID === vesselId)?._package;
      if (!dclp) return;

      const dataChannels = dclp?.dataChannelList?.dataChannel;
      if (!dataChannels || dataChannels.length === 0 || !dclp.header?.dataChannelListID?.version) return;

      const gmod = await VIS.instance.getGmod(visVersion);
      const codebooks = await VIS.instance.getCodebooks(visVersion);

      const localIds = dclp.dataChannelList?.dataChannel?.map(dc =>
        LocalId.parse(dc.dataChannelID?.localID!, gmod, codebooks)
      );

      localIds && setLocalIds(localIds);
      return localIds && Pmod.createFromLocalIds(visVersion, localIds);
    },
    [dataChannelListPackages, visVersion]
  );

  const getLocalIdsFromGmodPath = useCallback(
    (path: GmodPath): LocalId[] => {
      return (
        localIds?.filter(localId => {
          const items: (GmodPath | undefined)[] = [];
          switch (mode) {
            case VesselMode.Equipment:
              items.push(localId.primaryItem);
              break;
            case VesselMode.Consequence:
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
    [localIds, mode]
  );

  return (
    <ExploreContext.Provider
      value={{
        dataChannelListPackages,
        setDataChannelListPackages,
        fetchFilteredDataChannels,
        getVmodForVessel,
        getLocalIdsFromGmodPath,
        localIds,
        mode,
        setMode,
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
