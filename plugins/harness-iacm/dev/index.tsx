import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { harnessIacmPlugin, EntityIacmContent } from '../src/plugin';

createDevApp()
  .registerPlugin(harnessIacmPlugin)
  .addPage({
    element: <EntityIacmContent />,
    title: 'Root Page',
    path: '/harness-iacm',
  })
  .render();
