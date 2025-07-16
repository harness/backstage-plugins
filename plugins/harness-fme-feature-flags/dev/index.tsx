import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import {
  harnessFMEFeatureFlagsPlugin as harnessFMEFeatureFlagsPlugin,
  HarnessFMEFeatureFlagsPage,
} from '../src/plugin';

createDevApp()
  .registerPlugin(harnessFMEFeatureFlagsPlugin)
  .addPage({
    element: <HarnessFMEFeatureFlagsPage />,
    title: 'FME Feature Flags',
    path: '/harness-FME-feature-flags',
  })
  .render();
