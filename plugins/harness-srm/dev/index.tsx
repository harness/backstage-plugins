import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { harnessSrmPlugin, HarnessSrmPage } from '../src/plugin';

createDevApp()
  .registerPlugin(harnessSrmPlugin)
  .addPage({
    element: <HarnessSrmPage />,
    title: 'Root Page',
    path: '/harness-srm'
  })
  .render();
