import { useEntity } from '@backstage/plugin-catalog-react';

const usePerspectiveUrlFromEntity = () => {
  const { entity } = useEntity();

  return entity.metadata.annotations?.['harness.io/perspective-url'];
};

export default usePerspectiveUrlFromEntity;
