import { Defaults, VisVersion } from 'dnv-vista-sdk';
import React, { createContext, useState } from 'react';

export type VISContextType = {
  visVersion: VisVersion;
  setVisVersion: React.Dispatch<React.SetStateAction<VisVersion>>;
};

type VISContextProviderProps = React.PropsWithChildren<{}>;

const VISContext = createContext<VISContextType | undefined>(undefined);

const VISContextProvider = ({ children }: VISContextProviderProps) => {
  const [visVersion, setVisVersion] = useState<VisVersion>(Defaults.visVersion);

  return <VISContext.Provider value={{ visVersion, setVisVersion }}>{children}</VISContext.Provider>;
};

const useVISContext = () => {
  const context = React.useContext(VISContext);
  if (context === undefined) {
    throw new Error('useVISContext must be used within a VISContextProvider');
  }
  return context;
};

export { useVISContext, VISContextProvider };
