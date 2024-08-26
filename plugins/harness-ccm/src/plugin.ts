import {
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { OverviewCardProps } from './components/OverviewCard/OverviewCard';

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

export const EntityCcmOverviewCard: (props: OverviewCardProps) => JSX.Element =
  harnessCcmPlugin.provide(
    createComponentExtension({
      name: 'EntityCcmOverviewCard',
      component: {
        lazy: () =>
          import('./components/OverviewCard/OverviewCard').then(m => m.default),
      },
    }),
  );
