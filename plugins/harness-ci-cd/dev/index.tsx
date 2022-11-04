import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { harnessCiCdPlugin, HarnessCiCdPage } from '../src/plugin';

createDevApp()
  .registerPlugin(harnessCiCdPlugin)
  .addPage({
    element: <HarnessCiCdPage />,
    title: 'Root Page',
    path: '/harness-ci-cd'
  })
  .render();
