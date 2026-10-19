import { match } from 'path-to-regexp';

export const getIdentifiersFromUrl = (selectedProjectUrl: string) => {
  const projectUrlMatch = match(
    '(.*)/account/:accountId{/module}?/:module/orgs/:orgId/projects/:projectId/experiments',
    {
      decode: decodeURIComponent,
    },
  );

  const hostname = new URL(selectedProjectUrl).hostname;
  const baseUrl = new URL(selectedProjectUrl).origin;

  const envAB = hostname.split('.')[0];
  const envFromUrl = envAB === 'app' ? 'prod' : envAB;

  const projectUrlParams: any = projectUrlMatch(selectedProjectUrl);

  if (!projectUrlParams) {
    throw new Error(
      `Invalid harness.io/project-url "${selectedProjectUrl}". Expected format: https://app.harness.io/ng/account/<accountId>/module/chaos/orgs/<orgId>/projects/<projectId>/experiments`,
    );
  }

  return {
    orgId: projectUrlParams.params.orgId,
    accountId: projectUrlParams.params.accountId,
    projectId: projectUrlParams.params.projectId as string,
    urlParams: projectUrlParams,
    baseUrl: baseUrl,
    env: envFromUrl,
  };
};
