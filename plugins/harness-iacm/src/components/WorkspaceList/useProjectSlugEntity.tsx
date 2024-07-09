import { match } from 'path-to-regexp';

export const useProjectSlugFromEntity = (
  isNewAnnotationPresent?: boolean,
  selectedProjectUrl?: string,
) => {
  let accountId;
  let orgId;
  let projectId;

  const urlMatch = match(
    '(.*)/account/:accountId/module/:module/orgs/:orgId/projects/:projectId/(.*)?',
    {
      decode: decodeURIComponent,
    },
  );

  if (isNewAnnotationPresent && selectedProjectUrl) {
    const hostname = new URL(selectedProjectUrl).hostname;
    const envAB = hostname.split('.harness.io')[0];
    const envFromUrl = envAB.includes('qa') ? 'qa' : 'prod';

    const urlParams: any = urlMatch(selectedProjectUrl ?? '');

    if (urlParams) {
      accountId = urlParams.params.accountId;
      orgId = urlParams.params.orgId;
      projectId = urlParams.params.projectId;
    }

    return { projectId, orgId, accountId, urlParams, envFromUrl };
  }

  return null;
};
