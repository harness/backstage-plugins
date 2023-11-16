import { match } from 'path-to-regexp';

export const useProjectSlugFromEntity = (selectedServiceUrl: string) => {
  const serviceUrlMatch = match(
    '(.*)/account/:accountId/:module/orgs/:orgId/projects/:projectId/services/:serviceId',
    {
      decode: decodeURIComponent,
    },
  );

  const hostname = new URL(selectedServiceUrl).hostname;
  const baseUrl1 = new URL(selectedServiceUrl).origin;

  const envAB = hostname.split('.')[0];
  const envFromUrl = envAB === 'app' ? 'prod' : envAB;

  const serviceUrlParams: any = serviceUrlMatch(selectedServiceUrl);

  return {
    orgId: serviceUrlParams.params.orgId,
    accountId: serviceUrlParams.params.accountId,
    serviceId: serviceUrlParams.params.serviceId,
    urlParams: serviceUrlParams,
    baseUrl1: baseUrl1,
    projectIds: serviceUrlParams.params.projectId as string,
    envFromUrl: envFromUrl,
  };
};
