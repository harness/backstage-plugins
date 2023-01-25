/* eslint-disable import/no-extraneous-dependencies */
import { useEntity } from '@backstage/plugin-catalog-react';
import { match } from 'path-to-regexp';

export const useProjectSlugFromEntity = () => {
  let accountId;
  let orgId;
  let projectId;
  const { entity } = useEntity();
  const url = 'harness.io/project-url';
  const URL = entity.metadata.annotations?.[url];
  const urlMatch = match(
    '(.*)/account/:accountId/:module/orgs/:orgId/projects/:projectId/(.*)',
    {
      decode: decodeURIComponent,
    },
  );
  const urlParams: any = urlMatch(URL ?? '');

  if (urlParams) {
    accountId = urlParams.params.accountId;
    orgId = urlParams.params.orgId;
    projectId = urlParams.params.projectId;
  }

  return { projectId, orgId, accountId, urlParams };
};
