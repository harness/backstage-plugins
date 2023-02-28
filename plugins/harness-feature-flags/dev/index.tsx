import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import {
  harnessFeatureFlagsPlugin,
  HarnessFeatureFlagsPage,
} from '../src/plugin';

createDevApp()
  .registerPlugin(harnessFeatureFlagsPlugin)
  .addPage({
    element: <HarnessFeatureFlagsPage />,
    title: 'Root Page',
    path: '/harness-feature-flags',
  })
  .render();
