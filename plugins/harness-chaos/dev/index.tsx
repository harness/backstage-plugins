import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { harnessChaosPlugin, EntityHarnessChaosContent } from '../src/plugin';

createDevApp()
  .registerPlugin(harnessChaosPlugin)
  .addPage({
    element: <EntityHarnessChaosContent />,
    title: 'Root Page',
    path: '/harness-chaos',
  })
  .render();
