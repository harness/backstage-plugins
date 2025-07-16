import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';
import { harnessFMEFeatureFlagsRouteRef } from './route-refs';

import { rootRouteRef } from './routes';

export const harnessFMEFeatureFlagsPlugin = createPlugin({
  id: 'harness-fme-feature-flags',
  routes: {
    root: rootRouteRef,
  },
});

export const HarnessFMEFeatureFlagsPage = harnessFMEFeatureFlagsPlugin.provide(
  createRoutableExtension({
    name: 'HarnessFMEFeatureFlagsPage',
    component: () => import('./components/Router').then(m => m.Router),
    mountPoint: harnessFMEFeatureFlagsRouteRef,
  }),
);

export const EntityHarnessFMEFeatureFlagContent =
  harnessFMEFeatureFlagsPlugin.provide(
    createRoutableExtension({
      name: 'HarnnessFMEFeatureFlagsContent',
      component: () => import('./components/Router').then(m => m.Router),
      mountPoint: harnessFMEFeatureFlagsRouteRef,
    }),
  );
