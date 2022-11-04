import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

export const harnessCiCdRouteRef = createRouteRef({
  id: 'harness-ci-cd',
});

export const harnessCIBuildRouteRef = createSubRouteRef({
  id: 'harness-ci-cd/build',
  parent: harnessCiCdRouteRef,
  path: '/:buildId',
});
