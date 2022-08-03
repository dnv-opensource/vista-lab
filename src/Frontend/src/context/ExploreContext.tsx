import { LocalId, Pmod, VIS, VisVersions } from 'dnv-vista-sdk';
import React, { createContext, useCallback, useState } from 'react';
import { VistaLabApi } from '../apiConfig';
import { DataChannelListPackage } from '../client/models/DataChannelListPackage';
import { VesselMode } from '../pages/explore/vessel/Vessel';
import { isNullOrWhitespace } from '../util/string';

export type ExploreContextType = {
  dataChannelListPackages?: DataChannelListPackage[];
  setDataChannelListPackages: React.Dispatch<React.SetStateAction<DataChannelListPackage[] | undefined>>;
  fetchFilteredDataChannels: (query?: string) => Promise<DataChannelListPackage[]>;
  getVmodForVessel: (vesselId?: string) => Promise<Pmod | undefined>;
  mode: VesselMode | undefined;
  setMode: React.Dispatch<React.SetStateAction<VesselMode | undefined>>;
};

type ExploreContextProviderProps = React.PropsWithChildren<{}>;

const ExploreContext = createContext<ExploreContextType | undefined>(undefined);

const ExploreContextProvider = ({ children }: ExploreContextProviderProps) => {
  const [dataChannelListPackages, setDataChannelListPackages] = useState<DataChannelListPackage[]>();
  const [mode, setMode] = useState<VesselMode | undefined>(VesselMode.Equipment);

  console.log(mode);

  const fetchFilteredDataChannels = useCallback(
    async (query?: string) => {
      const fetchAll = isNullOrWhitespace(query);
      const q = fetchAll ? null : [query!];
      const key = mode ? (mode === VesselMode.Consequence ? 'secondaryItem' : 'primaryItem') : 'primaryItem';

      const response = await VistaLabApi.DataChannelApi.dataChannelGetDataChannelByFilter({
        dataChannelFilter: { [key]: q },
      });

      return response;
    },
    [mode]
  );

  const getVmodForVessel = useCallback(
    async (vesselId?: string): Promise<Pmod | undefined> => {
      const dclp = dataChannelListPackages?.find(dclp => dclp._package?.header?.shipID === vesselId)?._package;
      if (!dclp) return;

      const dataChannels = dclp?.dataChannelList?.dataChannel;
      if (!dataChannels || dataChannels.length === 0 || !dclp.header?.dataChannelListID?.version) return;

      const visVersion =
        VisVersions.tryParse(dclp.header?.dataChannelListID?.version) ??
        VisVersions.tryParse(dclp.header?.dataChannelListID?.version.replace('v', '').replace('_', '-'));

      if (!visVersion) return;

      const gmod = await VIS.instance.getGmod(visVersion);
      const codebooks = await VIS.instance.getCodebooks(visVersion);

      const localIds = dclp.dataChannelList?.dataChannel?.map(dc =>
        LocalId.parse(dc.dataChannelID?.localID!, gmod, codebooks)
      );

      return localIds && Pmod.createFromLocalIds(localIds, gmod);
    },
    [dataChannelListPackages]
  );

  return (
    <ExploreContext.Provider
      value={{
        dataChannelListPackages,
        setDataChannelListPackages,
        fetchFilteredDataChannels,
        getVmodForVessel,
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
