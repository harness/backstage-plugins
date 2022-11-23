import { useEntity } from '@backstage/plugin-catalog-react';
import { match } from 'path-to-regexp';

export const useProjectSlugFromEntity = () => {
    let accountId, orgId, projectId;
    const { entity } = useEntity();
    const pipelineid = 'harness.io/ci-pipelineIds';
    const serviceid = 'harness.io/cd-serviceId';
    const url = 'harness.io/project-url';
    const pipelineId = entity.metadata.annotations?.[pipelineid]; 
    const serviceId = entity.metadata.annotations?.[serviceid]; 
    const URL = entity.metadata.annotations?.[url];
    const urlMatch = match("(.*)/account/:accountId/:module(ci|cd|home)/orgs/:orgId/projects/:projectId/(.*)", {
        decode: decodeURIComponent,
    });
    const urlParams: any = urlMatch(URL ?? '');
    
    if(urlParams) {
        accountId = urlParams.params.accountId;
        orgId = urlParams.params.orgId;
        projectId = urlParams.params.projectId;
    }

    return { projectId, orgId, accountId, pipelineId, serviceId, urlParams};
};