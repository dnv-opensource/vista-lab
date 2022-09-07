import React, { createContext, useCallback, useState } from 'react';
import { CollapseItem } from '../collapse-menu-item/CollapseMenuItem';

export type CollapseDirections = 'horizontal';

type CollapseMenuContextProviderProps = React.PropsWithChildren<{
  direction: CollapseDirections;
}>;
export type CollapseMenuContextType = {
  direction: CollapseDirections;
  expandItem: (item: CollapseItem, depth: number) => void;
  isExpanded: (item: CollapseItem, depth: number) => boolean;
};

const CollapseMenuContext = createContext<CollapseMenuContextType | undefined>(undefined);

const CollapseMenuContextProvider = ({ children, direction }: CollapseMenuContextProviderProps) => {
  const [activeItems, setActiveItems] = useState<Map<number, CollapseItem>>(new Map());

  const expandItem = useCallback(
    (item: CollapseItem, depth: number) => {
      setActiveItems(activeItems => {
        activeItems.set(depth, item);

        for (const i of activeItems.keys()) {
          if (i > depth) activeItems.delete(i);
        }

        return new Map(activeItems);
      });
    },
    [setActiveItems]
  );

  const isExpanded = useCallback(
    (item: CollapseItem, depth: number) => {
      return !!(activeItems.get(depth)?.title === item.title);
    },
    [activeItems]
  );

  return (
    <CollapseMenuContext.Provider value={{ direction, expandItem, isExpanded }}>
      {children}
    </CollapseMenuContext.Provider>
  );
};

const useCollapseMenuContext = () => {
  const context = React.useContext(CollapseMenuContext);
  if (context === undefined) {
    throw new Error('The CollapseMenuItem must be used within a CollapseMenu component');
  }
  return context;
};

export { useCollapseMenuContext, CollapseMenuContextProvider };
