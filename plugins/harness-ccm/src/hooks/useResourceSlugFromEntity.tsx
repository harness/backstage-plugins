import { match } from 'path-to-regexp';

export const useResourceSlugFromEntity = (perspectiveUrl?: string) => {
  const cleanedString = perspectiveUrl?.split(' ')[0];
  let accountId;
  let orgId;
  let projectId;
  let perspectiveId;

  const urlMatch = match(
    '(.*)/account/:accountId/module/:module/perspectives/:perspectiveId/(.*)',
    {
      decode: decodeURIComponent,
    },
  );

  if (cleanedString) {
    const hostname = new URL(cleanedString).hostname;
    const baseUrl = new URL(cleanedString).origin;

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
      baseUrl,
    };
  }

  return {};
};
