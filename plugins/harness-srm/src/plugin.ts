import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { harnessSrmRouteRef } from './route-refs';

export const harnessSrmPlugin = createPlugin({
  id: 'harness-srm',
  routes: {
    root: rootRouteRef,
  },
});

export const HarnessSrmPage = harnessSrmPlugin.provide(
  createRoutableExtension({
    name: 'HarnessSrmPage',
    component: () => import('./components/Router').then(m => m.Router),
    mountPoint: harnessSrmRouteRef,
  }),
);
export const EntityHarnessSrmContent = harnessSrmPlugin.provide(
  createRoutableExtension({
    name: 'HarnnessSrmContent',
    component: () => import('./components/Router').then(m => m.Router),
    mountPoint: harnessSrmRouteRef,
  }),
);
