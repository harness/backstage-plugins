import { useEntity } from '@backstage/plugin-catalog-react';
import { match } from 'path-to-regexp';

export const useProjectSlugFromEntity = (
  env: string,
  isNewAnnotationPresent: boolean,
  selectedPipelineUrl: string,
) => {
  let accountId;
  let orgId;
  let projectId;
  let pipelineid;
  let serviceid;
  let url;
  let projectids: string | undefined;
  const { entity } = useEntity();

  if (isNewAnnotationPresent) {
    const containsModule = selectedPipelineUrl.includes('/module/');
    const containsAll = selectedPipelineUrl.includes('/all/');

    let pipelineUrlMatch;
    let serviceUrlMatch;

    if (containsModule) {
      pipelineUrlMatch = match(
        '(.*)/account/:accountId/module/:module/orgs/:orgId/projects/:projectId/pipelines/:pipelineId/(.*)',
        {
          decode: decodeURIComponent,
        },
      );

      serviceUrlMatch = match(
        '(.*)/account/:accountId/module/:module/orgs/:orgId/projects/:projectId/services/:serviceId',
        {
          decode: decodeURIComponent,
        },
      );
    } else if (containsAll) {
      pipelineUrlMatch = match(
        '(.*)/account/:accountId/all/orgs/:orgId/projects/:projectId/pipelines/:pipelineId/(.*)',
        {
          decode: decodeURIComponent,
        },
      );

      serviceUrlMatch = match(
        '(.*)/account/:accountId/all/orgs/:orgId/projects/:projectId/services/:serviceId',
        {
          decode: decodeURIComponent,
        },
      );
    } else {
      pipelineUrlMatch = match(
        '(.*)/account/:accountId/:module/orgs/:orgId/projects/:projectId/pipelines/:pipelineId/(.*)',
        {
          decode: decodeURIComponent,
        },
      );

      serviceUrlMatch = match(
        '(.*)/account/:accountId/:module/orgs/:orgId/projects/:projectId/services/:serviceId',
        {
          decode: decodeURIComponent,
        },
      );
    }

    const hostname = new URL(selectedPipelineUrl).hostname;
    const baseUrl1 = new URL(selectedPipelineUrl).origin;

    const envAB = hostname.split('.harness.io')[0];
    const envFromUrl = envAB.includes('qa') ? 'qa' : 'prod';

    const urlParams: any = pipelineUrlMatch(selectedPipelineUrl);
    if (urlParams) {
      return {
        orgId: urlParams.params.orgId,
        accountId: urlParams.params.accountId,
        pipelineId: urlParams.params.pipelineId,
        urlParams,
        baseUrl1: baseUrl1,
        projectIds: urlParams.params.projectId as string,
        envFromUrl: envFromUrl,
      };
    }

    const serviceUrlParams: any = serviceUrlMatch(selectedPipelineUrl);
    if (serviceUrlParams) {
      return {
        orgId: serviceUrlParams.params.orgId,
        accountId: serviceUrlParams.params.accountId,
        serviceId: serviceUrlParams.params.serviceId,
        urlParams: serviceUrlParams,
        baseUrl1: baseUrl1,
        projectIds: serviceUrlParams.params.projectId as string,
        envFromUrl: envFromUrl,
      };
    }

    // Handle the case where neither URL pattern matches
    return {
      error: 'Invalid URL format',
    };
  }

  if (env && env !== 'prod') {
    pipelineid = `harness.io/ci-pipelineIds-${env}`;
    serviceid = `harness.io/cd-serviceId-${env}`;
    url = `harness.io/project-url-${env}`;
    projectids = `harness.io/projects-${env}`;
  } else {
    pipelineid = 'harness.io/ci-pipelineIds';
    serviceid = 'harness.io/cd-serviceId';
    url = 'harness.io/project-url';
    projectids = 'harness.io/projects';
  }

  let projectIds = entity.metadata.annotations?.[projectids];
  const pipelineId = entity.metadata.annotations?.[pipelineid];
  const serviceId = entity.metadata.annotations?.[serviceid];
  const uRL = entity.metadata.annotations?.[url];
  const hostname = new URL(uRL ?? '').hostname;
  const baseUrl1 = new URL(uRL ?? '').origin;
  const urlMatch = match(
    '(.*)/account/:accountId/:module/orgs/:orgId/projects/:projectId/(.*)',
    {
      decode: decodeURIComponent,
    },
  );
  const urlParams: any = urlMatch(uRL ?? '');

  if (urlParams) {
    accountId = urlParams.params.accountId;
    orgId = urlParams.params.orgId;
    projectId = urlParams.params.projectId;
    if (!projectIds) {
      projectIds = projectId;
    }
  }

  return {
    orgId,
    accountId,
    pipelineId,
    serviceId,
    urlParams,
    hostname,
    baseUrl1,
    projectIds,
  };
};
