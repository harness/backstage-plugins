// import { useEntity } from '@backstage/plugin-catalog-react';
import { useEntity } from '@backstage/plugin-catalog-react';

export const useProjectSlugFromEntity = () => {
  const { entity } = useEntity();
  const workspaceIdAnnotation = 'harnessfme/projectId';
  const workspaceId = entity.metadata.annotations?.[ workspaceIdAnnotation] as string;

  const orgIdAnnotation = 'harnessfme/accountId';
  const orgId = entity.metadata.annotations?.[orgIdAnnotation] as string;

  const harnessAccountAnnotation = 'harnessfme/harnessAccountIdentifier'
  const harnessAccountId = entity.metadata.annotations?.[harnessAccountAnnotation] as string;

  const harnessOrgIdentifier = 'harnessfme/harnessOrgIdentifier'
  const harnessOrgId = entity.metadata.annotations?.[harnessOrgIdentifier] as string;

  const harnessProjectIdentifier = 'harnessfme/harnessProjectIdentifier'
  const harnessProjectId = entity.metadata.annotations?.[harnessProjectIdentifier] as string;

  return { workspaceId, orgId, harnessAccountId, harnessOrgId, harnessProjectId };
};
