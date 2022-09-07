import clsx from 'clsx';
import React from 'react';
import CollapseMenuItem from './collapse-menu-item/CollapseMenuItem';
import './CollapseMenu.scss';
import { CollapseDirections, CollapseMenuContextProvider } from './context/CollapseMenuContext';

interface Props {
  direction?: CollapseDirections;
  className?: string;
}
export const COLLAPSE_MENU_IDENTIFIER = 'ui-collapse-menu';
/**@description Use CollapseMenuItem to create menu. In the making */
const CollapseMenu: React.FC<React.PropsWithChildren<Props>> = ({ direction = 'horizontal', className, children }) => {
  return (
    <CollapseMenuContextProvider direction={direction}>
      <div className={clsx('ui-collapse-menu', className, direction)} id={COLLAPSE_MENU_IDENTIFIER}>
        {children}
      </div>
    </CollapseMenuContextProvider>
  );
};

export { CollapseMenuItem };

export default CollapseMenu;
