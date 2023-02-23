import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';
import { harnessFeatureFlagsRouteRef } from './route-refs';

import { rootRouteRef } from './routes';

export const harnessFeatureFlagsPlugin = createPlugin({
  id: 'harness-feature-flags',
  routes: {
    root: rootRouteRef,
  },
});

export const HarnessFeatureFlagsPage = harnessFeatureFlagsPlugin.provide(
  createRoutableExtension({
    name: 'HarnessFeatureFlagsPage',
    component: () => import('./components/Router').then(m => m.Router),
    mountPoint: harnessFeatureFlagsRouteRef,
  }),
);

export const EntityHarnessFeatureFlagContent =
  harnessFeatureFlagsPlugin.provide(
    createRoutableExtension({
      name: 'HarnnessFeatureFlagsContent',
      component: () => import('./components/Router').then(m => m.Router),
      mountPoint: harnessFeatureFlagsRouteRef,
    }),
  );
