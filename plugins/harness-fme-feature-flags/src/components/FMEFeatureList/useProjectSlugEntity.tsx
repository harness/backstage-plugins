// import { useEntity } from '@backstage/plugin-catalog-react';
import { useEntity } from '@backstage/plugin-catalog-react';

export const useProjectSlugFromEntity = () => {
  const { entity } = useEntity();
  const workspaceIdAnnotation = 'harnessfme/projectId';
  const orgIdAnnotation = 'harnessfme/accountId';
  const workspaceId = entity.metadata.annotations?.[workspaceIdAnnotation] as string;
  const orgId = entity.metadata.annotations?.[orgIdAnnotation] as string;


  return { workspaceId, orgId };
};
