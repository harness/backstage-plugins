import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { embedPlugin, EmbedPage } from '../src/plugin';

createDevApp()
  .registerPlugin(embedPlugin)
  .addPage({
    element: <EmbedPage />,
    title: 'Root Page',
    path: '/embed'
  })
  .render();
