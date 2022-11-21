import { useEntity } from '@backstage/plugin-catalog-react';

export const useProjectSlugFromEntity = () => {
    const { entity } = useEntity();
    const projectid = 'harness.io/cicd-projectId';
    const orgid = 'harness.io/cicd-orgId';
    const accid = 'harness.io/cicd-accountId';
    const pipelineid = 'harness.io/ci-pipelineIds';
    const serviceid = 'harness.io/cd-serviceId';
    const accountId = entity.metadata.annotations?.[accid]; 
    const projectId = entity.metadata.annotations?.[projectid]; 
    const orgId = entity.metadata.annotations?.[orgid]; 
    const pipelineId = entity.metadata.annotations?.[pipelineid]; 
    const serviceId = entity.metadata.annotations?.[serviceid]; 
    return { projectId, orgId, accountId, pipelineId, serviceId};
};