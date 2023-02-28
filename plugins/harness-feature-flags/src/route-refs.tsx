import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

export const harnessFeatureFlagsRouteRef = createRouteRef({
  id: 'harness-feature-flag',
});

export const harnessFeatureRouteRef = createSubRouteRef({
  id: 'harness-feature-flag/features',
  parent: harnessFeatureFlagsRouteRef,
  path: '/:buildId',
});
