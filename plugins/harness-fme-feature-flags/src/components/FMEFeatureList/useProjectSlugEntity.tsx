// import { useEntity } from '@backstage/plugin-catalog-react';
import { useEntity } from '@backstage/plugin-catalog-react';

export const useProjectSlugFromEntity = () => {
  const { entity } = useEntity();

  const isMigratedAnnotation = 'harnessfme/isMigrated';
  const isMigrated = entity.metadata.annotations?.[isMigratedAnnotation] as string;

  let workspaceId = '';
  let orgId = '';
  let harnessAccountId = '';
  let harnessOrgId = '';
  let harnessProjectId = '';

  if (isMigrated === 'true') {
    const myWorkAnnotation = 'harnessfme/mywork';
    const myWorkUrl = entity.metadata.annotations?.[myWorkAnnotation] as string;
    const urlAsArray = myWorkUrl.split('/');
    workspaceId = urlAsArray[urlAsArray.length - 2];
    orgId = urlAsArray[urlAsArray.length - 4];
    harnessProjectId = urlAsArray[urlAsArray.length - 6];
    harnessAccountId = urlAsArray[urlAsArray.length - 12];
    harnessOrgId = urlAsArray[urlAsArray.length - 8];
  } else {
    const accountIdAnnotation = 'harnessfme/accountId';
    orgId = entity.metadata.annotations?.[accountIdAnnotation] as string;
    const projectIdAnnotation = 'harnessfme/projectId';
    workspaceId = entity.metadata.annotations?.[projectIdAnnotation] as string;
  }

  return {
    workspaceId,
    orgId,
    harnessAccountId,
    harnessOrgId,
    harnessProjectId,
    isMigrated,
  };
};
