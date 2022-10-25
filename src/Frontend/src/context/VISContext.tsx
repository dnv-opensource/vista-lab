import { Codebooks, Gmod, VIS, VisVersion } from 'dnv-vista-sdk';
import React, { createContext, useEffect, useState } from 'react';

export type VISContextType = {
  visVersion: VisVersion;
  setVisVersion: React.Dispatch<React.SetStateAction<VisVersion>>;
  gmod?: Gmod;
  codebooks?: Codebooks;
};

type VISContextProviderProps = React.PropsWithChildren<{}>;

const VISContext = createContext<VISContextType | undefined>(undefined);

const VISContextProvider = ({ children }: VISContextProviderProps) => {
  const [visVersion, setVisVersion] = useState<VisVersion>(VisVersion.v3_4a);
  const [gmod, setGmod] = useState<Gmod>();
  const [codebooks, setCodebooks] = useState<Codebooks>();

  useEffect(() => {
    const getVisData = async () => {
      const gmod = await VIS.instance.getGmod(visVersion);
      const codebooks = await VIS.instance.getCodebooks(visVersion);

      setGmod(gmod);
      setCodebooks(codebooks);
    };

    getVisData();
  }, [visVersion]);

  return <VISContext.Provider value={{ visVersion, setVisVersion, gmod, codebooks }}>{children}</VISContext.Provider>;
};

const useVISContext = () => {
  const context = React.useContext(VISContext);
  if (context === undefined) {
    throw new Error('useVISContext must be used within a VISContextProvider');
  }
  return context;
};

export { useVISContext, VISContextProvider };
