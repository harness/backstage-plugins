import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { harnessCcmPlugin, HarnessCcmPage } from '../src/plugin';

createDevApp()
  .registerPlugin(harnessCcmPlugin)
  .addPage({
    element: <HarnessCcmPage />,
    title: 'Root Page',
    path: '/harness-ccm',
  })
  .render();
