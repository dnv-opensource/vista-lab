import React, { createContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { VistaLabApi } from '../apiConfig';

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
};

type LabContextProviderProps = React.PropsWithChildren<{}>;

const LabContext = createContext<LabContextType | undefined>(undefined);

const LabContextProvider = ({ children }: LabContextProviderProps) => {
  const [fleet, setFleet] = useState<Fleet>({ id: 'fleet', name: 'Fleet', vessels: [] });
  const { vessel: vesselParam } = useParams();

  const vessel = useMemo(() => fleet.vessels.find(v => v.id === vesselParam) ?? fleet, [vesselParam, fleet]);

  useEffect(() => {
    VistaLabApi.dataChannelGetVessels().then(vessels =>
      setFleet({
        id: 'fleet',
        name: 'Fleet',
        vessels: vessels.map(v => ({ id: v.vesselId, numberDataChannels: v.numberOfDataChannels, name: v.name })),
      })
    );
  }, []);

  return <LabContext.Provider value={{ vessel, fleet }}>{children}</LabContext.Provider>;
};

const useLabContext = () => {
  const context = React.useContext(LabContext);
  if (context === undefined) {
    throw new Error('useLabContext must be used within a LabContextProvider');
  }
  return context;
};

export { useLabContext, LabContextProvider };
