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

export const HarnessCcmPage = harnessCcmPlugin.provide(
  createRoutableExtension({
    name: 'HarnessCcmPage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
