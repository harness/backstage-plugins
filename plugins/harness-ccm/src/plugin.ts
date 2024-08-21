import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const harnessCcmPlugin = createPlugin({
  id: 'harness-ccm',
  routes: {
    root: rootRouteRef,
  },
});

export const EntityCcmContent = harnessCcmPlugin.provide(
  createRoutableExtension({
    name: 'HarnessCcmPage',
    component: () => import('./components/Router').then(m => m.Router),
    mountPoint: rootRouteRef,
  }),
);
