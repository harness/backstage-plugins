import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const harnessChaosPlugin = createPlugin({
  id: 'harness-chaos',
  routes: {
    root: rootRouteRef,
  },
});

export const EntityHarnessChaosContent = harnessChaosPlugin.provide(
  createRoutableExtension({
    name: 'HarnessChaosPage',
    component: () => import('./components/Router').then(m => m.Router),
    mountPoint: rootRouteRef,
  }),
);
