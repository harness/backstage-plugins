import React from 'react';
import { Typography, Grid } from '@material-ui/core';
import {
  InfoCard,
  Header,
  Page,
  Content,
  ContentHeader,
  HeaderLabel,
  SupportButton,
} from '@backstage/core-components';

export const ExampleComponent = () => (
  <Page themeId="tool">
    <Header title="Welcome to harness-feature-flags!" subtitle="Optional subtitle">
      <HeaderLabel label="Owner" value="Community-Engineering" />
      <HeaderLabel label="Lifecycle" value="Alpha" />
    </Header>
    <Content>
      <ContentHeader title="Plugin title">
        <SupportButton>Harness Backstage Plugin for Feature Flags</SupportButton>
      </ContentHeader>
      <Grid container spacing={3} direction="column">
        <Grid item>
          <InfoCard title="Information card">
            <Typography variant="body1">
            <a href="https://www.harness.io/products/feature-flags">More Details on Harness Feature Module</a>
            </Typography>
          </InfoCard>
        </Grid>
      </Grid>
    </Content>
  </Page>
);
