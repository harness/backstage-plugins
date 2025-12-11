# Harness Feature Flags Plugin

Website: [https://harness.io/](https://harness.io/)

Welcome to the Harness FME Feature Flags plugin for Backstage!

This plugin supports both **migrated** and **non-migrated** Split.io environments:
- **Migrated environments**: Feature flags that have been migrated to Harness FME (uses Harness APIs)  
- **Non-migrated environments**: Feature flags still running on Split.io (uses Split.io APIs)

The plugin automatically detects which environment type you're using based on your entity annotations and routes API calls accordingly.

## Screenshots

<img src="./src/assets/FeatureList.png" />

## Setup steps

1. Open terminal and navigate to the _root of your Backstage app_. Then run

```
yarn add --cwd packages/app @harnessio/backstage-plugin-fme-feature-flags

yarn install
```

If you are looking to get started with Backstage, check out [backstage.io/docs](https://backstage.io/docs/getting-started/).

For testing purposes, you can also clone this repository to try out the plugin. It contains an example Backstage app setup which is pre-installed with Harness plugins. However, you must create a new Backstage app if you are looking to get started with Backstage.

2. Configure proxy settings in your `app-config.yaml` under the `proxy` config.

### For Migrated Environments (Harness FME)
Ensure you have a service account for `x-api-key`. See the [Harness API Docs](https://developer.harness.io/docs/platform/automation/api/api-quickstart/) for generating an API Key.

```yaml
# In app-config.yaml

proxy:
  # ... existing proxy settings
  '/harness/prod':      
    target: 'https://app.harness.io/'
    headers:
      'x-api-key': '<Harness API Token>'
# ...

# You can also configure the base URLs in app-config.yaml
harness:
  baseUrl: 'https://app.harness.io/'
```

### For Non-Migrated Environments (Split.io)
Configure Split.io proxy with your Split.io API token:

```yaml
# In app-config.yaml

proxy:
  # ... existing proxy settings
  '/harnessfme/internal':      
    target: 'https://api.split.io/'
    headers:
      'Authorization': 'Bearer <Split.io API Token>'
# ...

harnessfme:
  baseUrl: 'https://api.split.io/'
```

**Notes:**

- For **migrated environments**: Plugin uses the Harness API token to make Harness FME API calls
- For **non-migrated environments**: Plugin uses the Split.io API token to make Split.io API calls  
- Make sure tokens have the necessary permissions for feature flag operations


3. Inside your Backstage's `EntityPage.tsx`, add the new `FMEfeatureFlagList` component to render `<EntityHarnessFMEFeatureFlagContent />` whenever the service is using Harness Feature Flags. Something like this -

```tsx
// In packages/app/src/components/catalog/EntityPage.tsx

import {
  isHarnessFMEFeatureFlagAvailable,
  EntityHarnessFMEFeatureFlagContent,
} from '@harnessio/backstage-plugin-fme-feature-flags';

...

const featureFlagList = (
  <EntitySwitch>
    <EntitySwitch.Case if={isHarnessFMEFeatureFlagAvailable}>
      <EntityHarnessFMEFeatureFlagContent />
    </EntitySwitch.Case>

    <EntitySwitch.Case>
      <EmptyState
        title="No FME Feature Flags available for this entity"
        missing="info"
        description="You need to add an annotation to your component if you want to enable Feature Flags for it. You can read more about annotations in Backstage by clicking the button below."
        action={
          <Button
            variant="contained"
            color="primary"
            href="https://backstage.io/docs/features/software-catalog/well-known-annotations"
          >
            Read more
          </Button>
        }
      />
    </EntitySwitch.Case>
  </EntitySwitch>
);

...

const serviceEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/fme-feature-flag" title="FME Feature Flags">
      {FMEList}
    </EntityLayout.Route>
  </EntityLayout>
);

...

```

4. Add required annotations to your software component's respective `catalog-info.yaml` file.

The plugin supports two configuration modes based on your environment:

### For Migrated Environments (Harness FME)

You will need your `My Work` URL from the Harness FME console. Log into your Harness FME console, navigate to the `My Work` section, and copy the URL from the browser.

Example URL:
```
https://app.harness.io/ng/account/HARNESS_ACCOUNT_ID/module/fme/orgs/HARNESS_ORG_ID/projects/HARNESS_PROJECT_ID/org/fmeAcountId/ws/fmeProjectId/mywork
```

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  # ...
  annotations:
    # Required for migrated environments
    harnessfme/mywork: https://app.harness.io/ng/account/HARNESS_ACCOUNT_ID/module/fme/orgs/HARNESS_ORG_ID/projects/HARNESS_PROJECT_ID/org/fmeAcountId/ws/fmeProjectId/mywork
    harnessfme/isMigrated: "true"  # This tells the plugin to use Harness APIs
spec:
  type: service
  # ...
```

### For Non-Migrated Environments (Split.io)

For environments still running on Split.io, you need to provide the account and project IDs directly:

You can get these from the URL when you are logged in to the Split.io console on the mywork page.

https://app.split.io/org/ACCOUNT_ID/ws/PROJECT_ID/mywork

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  # ...
  annotations:
    # Required for non-migrated environments  
    harnessfme/accountId: ACCOUNT_ID    # Your Split.io account ID
    harnessfme/projectId: PROJECT_ID    # Your Split.io workspace ID
    harnessfme/isMigrated: "false"  # This tells the plugin to use Split.io APIs
spec:
  type: service
  # ...
```

**Important:** The `harnessfme/isMigrated` annotation determines which API endpoints and authentication methods the plugin uses. Set it to `"true"` for migrated environments or `"false"` for Split.io environments.



## Features

- Connect a Backstage service with a Harness project and view the list of all Feature Flags.
- See details about a Feature Flags - state(killed/live), trafficType, last modified and created.
- Filter the Feature Flags and their corresponding information according to the Environments.
