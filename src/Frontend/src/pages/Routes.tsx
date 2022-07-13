import React, { Suspense } from 'react';
import { BrowserRouter, Routes as BrowserRoutes, Route } from 'react-router-dom';
import FleetGrid from '../components/explore/FleetGrid/FleetGrid';
import Layout from '../components/layout/Layout';
import Vessel from './explore/vessel/Vessel';

const Home = React.lazy(() => import('./home/Home'));
const Explore = React.lazy(() => import('./explore/Explore'));

export const routesList = [
  {
    path: '/explore',
    element: <Explore />,
    title: 'Explore',
    routes: (
      <>
        <Route path={':vesselId'} element={<Vessel />} />
        <Route path="" element={<FleetGrid />} />
      </>
    ),
  },
];

const Routes: React.FC = () => {
  return (
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
  );
};

export default Routes;
