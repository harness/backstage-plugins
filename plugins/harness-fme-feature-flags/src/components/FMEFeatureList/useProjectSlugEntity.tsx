// import { useEntity } from '@backstage/plugin-catalog-react';
import { useEntity } from '@backstage/plugin-catalog-react';

export const useProjectSlugFromEntity = () => {
  const { entity } = useEntity();
  const workspaceIdAnnotation = 'harnessfme/projectId';
  const workspaceId = entity.metadata.annotations?.[ workspaceIdAnnotation] as string;

  const orgIdAnnotation = 'harnessfme/accountId';
  const orgId = entity.metadata.annotations?.[orgIdAnnotation] as string;

  const harnessAccountAnnotation = 'harness/accountIdentifier'
  const harnessAccountId = entity.metadata.annotations?.[harnessAccountAnnotation] as string;

  const harnessOrgIdentifier = 'harness/orgIdentifier'
  const harnessOrgId = entity.metadata.annotations?.[harnessOrgIdentifier] as string;

  const harnessProjectIdentifier = 'harness/projectIdentifier'
  const harnessProjectId = entity.metadata.annotations?.[harnessProjectIdentifier] as string;

  return { workspaceId, orgId, harnessAccountId, harnessOrgId, harnessProjectId };
};
