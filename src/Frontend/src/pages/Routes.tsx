import React, { Suspense } from 'react';
import { BrowserRouter, Routes as BrowserRoutes, Route } from 'react-router-dom';
import FleetGrid from './explore/fleet/Fleet';
import Layout from '../components/layout/Layout';
import { ExploreContextProvider } from '../context/ExploreContext';
import Vessel from './explore/vessel/Vessel';
import { VISContextProvider } from '../context/VISContext';
import { PanelContextProvider } from '../context/PanelContext';
import Monitor from './monitor/Monitor';
import { IconName } from '../components/ui/icons/icons';
import Panel from './monitor/panel/Panel';
import Panels from './monitor/panels/Panels';

const Home = React.lazy(() => import('./home/Home'));
const Explore = React.lazy(() => import('./explore/Explore'));

type RouteProp = {
  path: string;
  element: JSX.Element;
  routes?: JSX.Element;
  title: string;
  icon: IconName;
};

export const routesList: RouteProp[] = [
  {
    path: '/explore',
    element: (
      <ExploreContextProvider>
        <Explore />
      </ExploreContextProvider>
    ),
    title: 'Explore',
    routes: (
      <>
        <Route path={':vesselId'} element={<Vessel />} />
        <Route path="" element={<FleetGrid />} />
      </>
    ),
    icon: IconName.Search,
  },
  {
    path: '/monitor',
    element: <Monitor />,
    title: 'Monitor',
    icon: IconName.ChartColumn,
    routes: (
      <>
        <Route path={':panelId'} element={<Panel />} />
        <Route path="" element={<Panels />} />
      </>
    ),
  },
];

const Routes: React.FC = () => {
  return (
    <VISContextProvider>
      <PanelContextProvider>
        <BrowserRouter>
          <Layout>
            <Suspense fallback={<div>Loading page</div>}>
              <BrowserRoutes>
                {routesList.map(route => (
                  <Route key={route.path} path={route.path} element={route.element}>
                    {route.routes}
                  </Route>
                ))}
                <Route path={''} element={<Home />} />
              </BrowserRoutes>
            </Suspense>
          </Layout>
        </BrowserRouter>
      </PanelContextProvider>
    </VISContextProvider>
  );
};

export default Routes;
