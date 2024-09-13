import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { harnessCcmPlugin, EntityCcmContent } from '../src/plugin';

createDevApp()
  .registerPlugin(harnessCcmPlugin)
  .addPage({
    element: <EntityCcmContent />,
    title: 'Root Page',
    path: '/harness-ccm',
  })
  .render();
