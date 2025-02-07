import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

export const harnessFMEFeatureFlagsRouteRef = createRouteRef({
  id: 'harness-fme-feature-flag',
});

export const harnessFMEFeatureRouteRef = createSubRouteRef({
  id: 'harness-fme-feature-flag/features',
  parent: harnessFMEFeatureFlagsRouteRef,
  path: '/:buildId',
});
