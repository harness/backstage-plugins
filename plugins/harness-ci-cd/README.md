# harness-ci-cd

Welcome to the Harness CI/CD plugin for Backstage!

## Getting started

## Steps

1. If you have a standalone app(you didn't clone this repo), then do

```
# From your Backstage root directory
yarn add --cwd packages/app @harnessio/backstage-plugin-ci-cd
yarn install
```

2. Configure proxy for harness in `app-config.yaml`. Add your Harness Personal Access Token or Service Account Token for `x-api-key` (see the [Harness docs](https://docs.harness.io/article/tdoad7xrh9-add-and-manage-api-keys) )

```yaml
# In app-config.yaml

proxy:
  '/harness':
    target: 'https://app.harness.io/'
    headers:
      'x-api-key': '<YOUR PAT/SAT>'
```

Note: If you have separate providers for CI and CD apart from Harness, you need to add a new tab for Harness pipelines instead of replacing your existing CI or CD tab.

<!-- TODO: Instructions on how to add a new tab. -->

3. Inside your `EntityPage.tsx`, update the `cicdContent` to render `<EntityHarnessCiCdContent />` whenever service is using Harness CI/CD. Example below

```tsx
// In packages/app/src/components/catalog/EntityPage.tsx

import {
  isHarnessCiCdAvailable,
  EntityHarnessCiCdContent,
} from '@harnessio/backstage-plugin-ci-cd';

const cicdContent = (
  // ...
  <EntitySwitch.Case if={isHarnessCiCdAvailable}>
    <EntityHarnessCiCdContent />
  </EntitySwitch.Case>
  // ...
);
```

4. Configure baseUrl for harness in `app-config.yaml`

```yaml
# In app-config.yaml

harness:
  baseUrl: https://app.harness.io/
```

5. Add required harness specific annotations to your respective catalog-info.yaml files,
   (example: https://github.com/harness/backstage-plugins/blob/main/examples/catalog-harness-cicd.yaml)

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  # ...
  annotations:
    # mandatory annotations
    harness.io/cicd-accountId: <harness_account_id>
    harness.io/cicd-orgId: <harness_org_id>
    harness.io/cicd-projectId: <harness_project_id>
    # optional annotations
    harness.io/ci-pipelineIds: <pipelineId1,pipelineId2,pipelineId3 etc>
    harness.io/cd-serviceId: <serviceId>
spec:
  type: service
  # ...
```

## Features

- List top 50 pipeline executions for a configured project/pipelineIds/serviceId
- Pipeline execution status
- Retry pipeline execution
- Pagination for builds
- Works for both personal access tokens and service account token
