import { match } from 'path-to-regexp';

export const useResourceSlugFromEntity = (
  isNewAnnotationPresent?: boolean,
  selectedWorkspace?: string,
) => {
  const cleanedString = selectedWorkspace?.split(' ')[0];
  let accountId;
  let orgId;
  let projectId;
  let perspectiveId;

  const urlMatch = match(
    '(.*)/account/:accountId/module/:module/orgs/:orgId/projects/:projectId/perspectives/:perspectiveId?',
    {
      decode: decodeURIComponent,
    },
  );

  if (isNewAnnotationPresent && cleanedString) {
    const hostname = new URL(cleanedString).hostname;

    const envAB = hostname.split('.harness.io')[0];
    const envFromUrl = envAB.includes('qa') ? 'qa' : 'prod';

    const urlParams: any = urlMatch(cleanedString ?? '');

    if (urlParams) {
      accountId = urlParams.params.accountId;
      orgId = urlParams.params.orgId;
      projectId = urlParams.params.projectId;
      perspectiveId = urlParams.params.perspectiveId;
    }

    return {
      projectId,
      perspectiveId,
      orgId,
      accountId,
      urlParams,
      envFromUrl,
      cleanedString,
    };
  }

  return {};
};
