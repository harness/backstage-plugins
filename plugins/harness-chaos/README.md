# Harness Chaos Engineering Plugin

Website: [https://harness.io/](https://harness.io/)

Welcome to the Harness Chaos Engineering plugin for Backstage!

## Screenshots

<img src="./src/assets/chaos-experiments.png" />

## Setup steps

1. Open terminal and navigate to the _root of your Backstage app_. Then run

```
yarn add --cwd packages/app @harnessio/backstage-plugin-harness-chaos

yarn install
```

If you are looking to get started with Backstage, check out [backstage.io/docs](https://backstage.io/docs/getting-started/).

For testing purposes, you can also clone this repository to try out the plugin. It contains an example Backstage app setup which is pre-installed with Harness plugins. However, you must create a new Backstage app if you are looking to get started with Backstage.

2. Configure proxy for harness in your `app-config.yaml` under the `proxy` config. Add your Harness Personal Access Token or Service Account Token for `x-api-key`. See the [Harness docs](https://docs.harness.io/article/tdoad7xrh9-add-and-manage-api-keys) for generating an API Key.

```yaml
# In app-config.yaml

proxy:
  # ... existing proxy settings
  '/harness':
    target: 'https://app.harness.io/'
    headers:
      'x-api-key': '<YOUR PAT/SAT>'
# ...
```

Notes:

- Plugin uses token configured here to make Harness API calls. Make sure this token has the necessary permissions

- Set the value of target to your on-prem URL if you are using the Harness on-prem offering

3. Inside your Backstage's `EntityPage.tsx`, update the `chaosContent` component to render `<EntityHarnessChaosContent />` whenever the service/project is using Harness Chaos Engineering. Something like this -

```tsx
// In packages/app/src/components/catalog/EntityPage.tsx

import {
  EntityHarnessChaosContent,
  isHarnessChaosAvailable,
} from '@harnessio/backstage-plugin-harness-chaos';

...

const chaosContent = (
  <EntitySwitch>
    <EntitySwitch.Case if={isHarnessChaosAvailable}>
      <EntityHarnessChaosContent />
    </EntitySwitch.Case>

    <EntitySwitch.Case>
      <EmptyState
        title="No Chaos data available for this entity"
        missing="info"
        description="You need to add an annotation to your component if you want to enable Chaos for it. You can read more about annotations in Backstage by clicking the button below."
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
    <EntityLayout.Route path="/chaos" title="Chaos Engineering">
      {chaosContent}
    </EntityLayout.Route>
  </EntityLayout>
);

...

```

4. Add required harness specific annotations to your software component's respective `catalog-info.yaml` file. (optional)

##### `harness.io/project-url` (required)

URL of the experiments page of your Harness project, in the format

```
https://app.harness.io/ng/account/<accountId>/module/chaos/orgs/<orgId>/projects/<projectId>/experiments
```

The older format without `/module` (`https://app.harness.io/ng/account/<accountId>/chaos/orgs/<orgId>/projects/<projectId>/experiments`) is also supported.

The plugin reads the account, organization and project from it and lists the experiments of that project. Only experiments tagged `<spec.type>=<metadata.name>` of the entity (for example `service=payment-service`) are shown, so add that tag to the experiments you want to see on the entity. If the URL doesn't match the format above, the plugin shows an error with the expected format.


##### What the table shows

- name, infrastructure, resilience score (of the latest run, `N/A` if the run has no score), recent runs, a link to the report of the latest run, last updated by, and actions to run an experiment or open it in Harness
- a filter to show experiments of a single infrastructure type
- the average resilience score of all matching experiments (not just the current page), along with how many experiments have a score out of the total. Experiments without a score are not counted, and the average is `N/A` if none of them has a score

Refer image below to locate an application map tag.

<img src="./src/assets/application-map-tags.png" />

Here is an example: [catalog-info.yaml](../../examples/catalog-harness-chaos.yaml)

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  # ...
  annotations:
    # mandatory annotation
    harness.io/project-url: <harness_project_url>

    # optional annotations
    harness.io/application-map-tags: |
      <nm-name_1>: <nm-label_1>
      <nm-name_2>: <nm-label_2>

spec:
  type: service
  # ...
```


## Other configurations

- (Optional) Harness URL

If you have a separate Harness hosted URL other than `https://app.harness.io`, you can configure `baseUrl` for `harness` in `app-config.yaml` This step is optional. The default value of `harness.baseUrl` is https://app.harness.io/

```yaml
# In app-config.yaml

harness:
  baseUrl: https://app.harness.io/
```

## Features

- Connect a Backstage service with a Harness project and view all the chaos experiments associated with that project.
- Add network-map tags to view targeted chaos experiments for a specific service/application map.
- Support for various infrastructure filters on the go.
- See details for last 10 runs such as resilience score, status and cron schedules.
- Directly run a chaos experiment from the dashboard itself.
- One click redirect to run details and infrastructure management screens.
