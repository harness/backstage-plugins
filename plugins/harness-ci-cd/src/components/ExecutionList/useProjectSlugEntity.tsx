import { useEntity } from '@backstage/plugin-catalog-react';
import { match } from 'path-to-regexp';

function convertStringToObject(inputString: string | undefined) {
  if (!inputString) return {};
  const object: Record<string, string> = {};
  const lines = inputString.split('\n');
  for (const line of lines) {
    if (line === '') continue;
    const [label, url] = line.split(':');
    const trimmedLabel = label.trim();
    const trimmedUrl = url.trim();
    object[trimmedLabel] = trimmedUrl;
  }
  return object;
}

export const useProjectSlugFromEntity = (env: string) => {
  let accountId;
  let orgId;
  let projectId;
  let pipelineid;
  let serviceid;
  let url;
  let projectids;
  const { entity } = useEntity();

  const harnessPipelineObject = convertStringToObject(
    entity.metadata.annotations?.['harness.io/pipelines'],
  );

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
