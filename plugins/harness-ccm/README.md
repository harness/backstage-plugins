# Harness Cloud Cost Management Plugin

Website: [https://harness.io/](https://harness.io/)

Welcome to the Harness CCM plugin for Backstage!

## Screenshots

<img src="./src/assets/harness-ccm-backstage-plugin-screenshot.png">


## Getting started

## Setup steps

1. Open terminal and navigate to the _root of your Backstage app_. Then run

```
yarn add --cwd packages/app @harnessio/backstage-plugin-harness-ccm

yarn install
```

If you are looking to get started with Backstage, check out [backstage.io/docs](https://backstage.io/docs/getting-started/).

For testing purposes, you can also clone this repository to try out the plugin. It contains an example Backstage app setup which is pre-installed with Harness plugins. However, you must create a new Backstage app if you are looking to get started with Backstage.

2. Configure proxy for harness in your `app-config.yaml` under the `proxy` config. Add your Harness Personal Access Token or Service Account Token for `x-api-key`. See the [Harness docs](https://docs.harness.io/article/tdoad7xrh9-add-and-manage-api-keys) for generating an API Key.

```yaml
# In app-config.yaml

proxy:
  # ... existing proxy settings
  '/harness/prod':
    target: 'https://app.harness.io/'
    headers:
      'x-api-key': '<YOUR PAT/SAT>'
# ...
```

Notes:

- Plugin uses token configured here to make Harness API calls. Make sure the user creating this API token has necessary permissions, which has `perspective view` permission and same applies for service accounts as well it must have a role assigned that has the roles with adequate permissions as described before. 

- Set the value of target to your on-prem URL if you are using the Harness on-prem offering

3. In your Backstage `EntityPage.tsx` file, import `EntityCcmContent`, `isHarnessCcmAvailable`, and `EntityCcmOverviewCard` from `@harnessio/backstage-plugin-harness-ccm`:

```tsx
// In packages/app/src/components/catalog/EntityPage.tsx

import {
  isHarnessCcmAvailable,
  EntityCcmContent,
  EntityCcmOverviewCard,
} from '@harnessio/backstage-plugin-harness-ccm';
```

#### Add EntityCcmContent
Use the imported components to add the Harness CCM content to your entity page:
```tsx
const ccmContent = (
    <EntityCcmContent />
);
```

#### Example for using ccmContent
```tsx
const websiteEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      {overviewContent}
    </EntityLayout.Route>
    {/* Add this route */}
    <EntityLayout.Route path="/ccm" title="Cloud Cost Management">
      {ccmContent}
    </EntityLayout.Route>
    {/* ... other routes ... */}
  </EntityLayout>
);
```

#### Add EntityCcmOverviewCard Widget
Add the EntityCcmOverviewCard to display an overview card:
```tsx
const overviewContent = (
  <Grid container spacing={3}>
    <Grid item md={6} xs={12}>
      <EntityCcmOverviewCard variant="gridItem" />
    </Grid>
  </Grid>
);
```



4. Add required harness specific annotations to your software component's respective `catalog-info.yaml` file.

Here is an example: [catalog-info-new.yaml](../../examples/catalog-harness-ccm.yaml)
```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  # ...
  annotations:
    # annotation
    harness.io/perspective-url: <harness_ccm_perspective_url>
```

## Features

- Link a Backstage service to a Harness Perspective to view resources in ways that better align with your business needs.



