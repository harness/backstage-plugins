import React from 'react';
import { FeatureList } from './FeatureList';
import { ThemeProvider } from '@material-ui/core';
import { lightTheme } from '@backstage/theme';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import {
  setupRequestMockHandlers,
  renderInTestApp,
} from '@backstage/test-utils';

describe('FeatureList', () => {
  const server = setupServer();
  // Enable sane handlers for network requests
  setupRequestMockHandlers(server);

  // setup mock response
  beforeEach(() => {
    server.use(
      rest.get('/*', (_, res, ctx) => res(ctx.status(200), ctx.json({}))),
    );
  });

  it('should render', async () => {
    const rendered = await renderInTestApp(
      <ThemeProvider theme={lightTheme}>
        <FeatureList />
      </ThemeProvider>,
    );
    expect(
      rendered.getByText('Welcome to harness-feature-flags!'),
    ).toBeInTheDocument();
  });
});
