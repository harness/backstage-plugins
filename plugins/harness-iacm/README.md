# harness-iacm

# Harness IACM plugin

Website: [https://harness.io/](https://harness.io/)

Welcome to the Harness IACM plugin for Backstage!

## Screenshots
<img src="./src/assets/harness-iacm-backstage-plugin-screenshot.png">



## Getting started

## Setup steps

1. Open terminal and navigate to the _root of your Backstage app_. Then run

```
yarn add --cwd packages/app @harnessio/backstage-plugin-iacm

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

- Plugin uses token configured here to make Harness API calls. Make sure the user creating this API token has necessary permissions, which include `project view` permission along with `pipeline view` and `execute` permissions and same applies for service accounts as well it must have a role assigned that has the roles with adequate permissions as described before. 

- Set the value of target to your on-prem URL if you are using the Harness on-prem offering

3. Inside your Backstage's `EntityPage.tsx`, update the `cicdContent` component to render `<EntityHarnessCiCdContent />` whenever the service is using Harness CI/CD. Something like this -

```tsx
// In packages/app/src/components/catalog/EntityPage.tsx

import {
  isHarnessCiCdAvailable,
  EntityHarnessCiCdContent,
} from '@harnessio/backstage-plugin-iacm';

const cicdContent = (
  // ...
  <EntitySwitch.Case if={isHarnessIacmAvailable}>
    <EntityHarnessIacmContent />
  </EntitySwitch.Case>
  // ...
);
```

Note: If you have separate providers for CI and CD apart from Harness, you need to add a new tab for Harness CI/CD plugin like below instead of replacing your existing CI/CD tab mentioned above.

<details>
  <summary>Instructions in case of separate CI and CD provider (Click to expand)</summary>

```tsx
// In packages/app/src/components/catalog/EntityPage.tsx

import {
  isHarnessCiCdAvailable,
  EntityHarnessCiCdContent,
} from '@harnessio/backstage-plugin-ci-cd';

const serviceEntityPage = (
  // ...
  <EntityLayout.Route
    path="/harness-ci-cd"
    title="Harness CI/CD"
    if={isHarnessCiCdAvailable}
  >
    <EntityHarnessCiCdContent />
  </EntityLayout.Route>
  // ...
);
```

</details>

4. Add required harness specific annotations to your software component's respective `catalog-info.yaml` file.

Here is an example: [catalog-info-new.yaml](../../examples/catalog-harness-iacm.yaml)
```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  # ...
  annotations:
    # annotation
    harness.io/workspace-url: |
      labelA: <harness_pipeline_url>
      labelB: <harness_pipeline_url>
  # here labelA / labelB denotes the value you will see in dropdown in workspace list. 

```



## Features

- Connect a Backstage service with a Harness workspace and view workspace resources.
- Navigate directly to specific pipeline from backstage


