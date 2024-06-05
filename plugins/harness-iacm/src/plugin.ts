import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const harnessIacmPlugin = createPlugin({
  id: 'harness-iacm',
  routes: {
    root: rootRouteRef,
  },
});

export const EntityIacmContent = harnessIacmPlugin.provide(
  createRoutableExtension({
    name: 'HarnessIacmPage',
    component: () => import('./components/Router').then(m => m.Router),
    mountPoint: rootRouteRef,
  }),
);
