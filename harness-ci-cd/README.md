# harness-ci-cd

Welcome to the harness-ci-cd plugin!


## Getting started

Steps:
Configure proxy for for harness in app-config.yaml. Add your Harness Personal Access Token for x-api-key(see the Harness docs )
# In app-config.yaml

proxy:
  '/harness':
    target: 'https://app.harness.io/'
    headers:
        'x-api-key': '' 
 
Add below EntityLayout.Route in your backstage app,
// In packages/app/src/components/catalog/EntityPage.tsx

import { EntityMyPluginCard, EntityMyPluginContent } from '@internal/plugin-harness-ci-cd';

const serviceEntityPage = (

 <EntityLayout.Route path="/my-plugin" title="Harness CI/CD">
      <EntityMyPluginContent />
    </EntityLayout.Route>
);
Add required harness specific annotations to your respective catalog-info.yaml files, (example: https://github.com/sandeepa-kv-jois/harness-core/blob/develop/catalog-info-harness-qa.yaml)
