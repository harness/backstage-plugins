import React from 'react';
import { convertLegacyRouteRef } from '@backstage/core-compat-api';
import {
  createFrontendPlugin,
  type FrontendPlugin,
} from '@backstage/frontend-plugin-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { isHarnessCiCdAvailable } from './components/Router';
import { rootRouteRef } from './routes';

/**
 * New frontend system entity tab. Apps on Backstage 1.53+ can install:
 *
 *   import harnessCiCdPlugin from '@harnessio/backstage-plugin-ci-cd/alpha';
 *
 * Legacy EntityPage.tsx wiring via EntityHarnessCiCdContent is unchanged.
 */
const entityHarnessCiCdContent = EntityContentBlueprint.make({
  name: 'entity',
  params: {
    path: 'harness-ci-cd',
    title: 'Harness CI/CD',
    group: 'deployment',
    filter: isHarnessCiCdAvailable,
    routeRef: convertLegacyRouteRef(rootRouteRef),
    loader: () => import('./components/Router').then(m => <m.Router />),
  },
});

const harnessCiCdFrontendPlugin: FrontendPlugin = createFrontendPlugin({
  pluginId: 'harness-ci-cd',
  extensions: [entityHarnessCiCdContent],
  routes: {
    root: convertLegacyRouteRef(rootRouteRef),
  },
});

export default harnessCiCdFrontendPlugin;
