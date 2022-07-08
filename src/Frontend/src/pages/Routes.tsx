import React, { Suspense } from 'react';
import { BrowserRouter, Routes as BrowserRoutes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';

const Home = React.lazy(() => import('./home/Home'));
const Explore = React.lazy(() => import('./explore/Explore'));

export const routesList = [
  {
    path: '/explore',
    element: <Explore />,
    title: 'Explore',
  },
];

const Routes: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Suspense fallback={<div>Loading page</div>}>
          <BrowserRoutes>
            {routesList.map(route => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}
            <Route path={''} element={<Home />} />
          </BrowserRoutes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
};

export default Routes;
