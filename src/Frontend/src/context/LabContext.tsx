import { DataChannelList, VisVersion } from 'dnv-vista-sdk';
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { VistaLabApi } from '../apiConfig';
import { SearchScope } from '../client';
import { useVISContext } from './VISContext';

interface CommonVesselProps {
  id: string;
  name?: string;
}

type Fleet = CommonVesselProps & {
  vessels: Vessel[];
};

export type Vessel = CommonVesselProps & {
  numberDataChannels: number;
};

export type LabContextType = {
  vessel: Vessel | Fleet;
  fleet: Fleet;
  isFleet: boolean;
  dataChannelListPackages?: DataChannelList.DataChannelListPackage[];
  setDataChannelListPackages: React.Dispatch<
    React.SetStateAction<DataChannelList.DataChannelListPackage[] | undefined>
  >;
  hasDataChannel: (dc: DataChannelList.DataChannel) => boolean;
};

type LabContextProviderProps = React.PropsWithChildren<{}>;

const LabContext = createContext<LabContextType | undefined>(undefined);

const LabContextProvider = ({ children }: LabContextProviderProps) => {
  const [fleet, setFleet] = useState<Fleet>({ id: 'fleet', name: 'Fleet', vessels: [] });
  const { vessel: vesselParam } = useParams();
  const { visVersion } = useVISContext();
  const [dataChannelListPackages, setDataChannelListPackages] = useState<DataChannelList.DataChannelListPackage[]>();

  const vessel = useMemo(() => fleet.vessels.find(v => v.id === vesselParam) ?? fleet, [vesselParam, fleet]);

  useEffect(() => {
    VistaLabApi.dataChannelGetVessels().then(vessels =>
      setFleet({
        id: 'fleet',
        name: 'Fleet',
        vessels: vessels.map(v => ({ id: v.vesselId, numberDataChannels: v.numberOfDataChannels, name: v.name })),
      })
    );

    const clientVersion = Object.values(VisVersion).indexOf(visVersion);
    VistaLabApi.searchSearch(clientVersion, {
      vesselId: undefined,
      scope: SearchScope._0,
      phrase: '',
    });
  }, [visVersion]);

  const isFleet = useMemo(() => {
    return vessel.id === 'fleet';
  }, [vessel.id]);

  const hasDataChannel = useCallback(
    (dc: DataChannelList.DataChannel) => {
      if (isFleet) return true;

      const dclp = dataChannelListPackages?.find(d => d.package.header.shipId.toString() === vessel.id);

      if (!dclp) return false;

      return !!dclp.package.dataChannelList.dataChannel.find(d =>
        d.dataChannelId.localId.equals(dc.dataChannelId.localId)
      );
    },
    [vessel, isFleet, dataChannelListPackages]
  );

  return (
    <LabContext.Provider
      value={{ dataChannelListPackages, setDataChannelListPackages, hasDataChannel, vessel, fleet, isFleet }}
    >
      {children}
    </LabContext.Provider>
  );
};

const useLabContext = () => {
  const context = React.useContext(LabContext);
  if (context === undefined) {
    throw new Error('useLabContext must be used within a LabContextProvider');
  }
  return context;
};

export { useLabContext, LabContextProvider };
