// import { useEntity } from '@backstage/plugin-catalog-react';
import { useEntity } from '@backstage/plugin-catalog-react';

export const useProjectSlugFromEntity = () => {
  const { entity } = useEntity();

  const myWorkAnnotation = 'harnessfme/mywork';
  const myWorkUrl = entity.metadata.annotations?.[myWorkAnnotation] as string;
  const urlAsArray = myWorkUrl.split('/');
  const workspaceId = urlAsArray[urlAsArray.length - 2];
  const orgId = urlAsArray[urlAsArray.length - 4];
  const harnessProjectId = urlAsArray[urlAsArray.length - 6];
  const harnessAccountId = urlAsArray[urlAsArray.length - 12];
  const harnessOrgId = urlAsArray[urlAsArray.length - 8];

  return {
    workspaceId,
    orgId,
    harnessAccountId,
    harnessOrgId,
    harnessProjectId,
  };
};
