import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const embedPlugin = createPlugin({
  id: 'embed',
  routes: {
    root: rootRouteRef,
  },
});

export const EmbedPage = embedPlugin.provide(
  createRoutableExtension({
    name: 'EmbedPage',
    component: () =>
      import('./components/EmbedComponent').then(m => m.EmbedComponent),
    mountPoint: rootRouteRef,
  }),
);
