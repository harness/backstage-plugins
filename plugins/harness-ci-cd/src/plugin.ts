import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';
import { harnessCiCdRouteRef } from './route-refs';

import { rootRouteRef } from './routes';

export const harnessCiCdPlugin = createPlugin({
  id: 'harness-ci-cd',
  routes: {
    root: rootRouteRef,
  },
});

export const HarnessCiCdPage = harnessCiCdPlugin.provide(
  createRoutableExtension({
    name: 'HarnessCiCdPage',
    component: () => import('./components/Router').then(m => m.Router),
    mountPoint: harnessCiCdRouteRef,
  }),
);
export const EntityHarnessCiCdContent = harnessCiCdPlugin.provide(
  createRoutableExtension({
    name: 'HarnnessCiCdContent',
    component: () => import('./components/Router').then(m => m.Router),
    mountPoint: harnessCiCdRouteRef,
  }),
);
