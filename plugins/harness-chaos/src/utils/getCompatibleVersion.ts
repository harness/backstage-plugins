import { Entity } from '@backstage/catalog-model';

type ChaosVersion = 'V1' | 'V2';

export const getChaosVersion = (entity: Entity | undefined): ChaosVersion => {
  if (!entity) return 'V1';

  if (
    Boolean(entity.metadata.annotations?.['harness.io/project-url']) &&
    !Boolean(entity.metadata.annotations?.['harness.io/service-tags']) &&
    !Boolean(entity.metadata.annotations?.['harness.io/application-map-tags'])
  )
    return 'V1';
  if (
    Boolean(entity.metadata.annotations?.['harness.io/project-url']) &&
    (Boolean(entity.metadata.annotations?.['harness.io/service-tags']) ||
      Boolean(entity.metadata.annotations?.['harness.io/application-map-tags']))
  )
    return 'V2';
  return 'V1';
};

export const isV1Compatible = (entity: Entity | undefined): boolean => {
  if (!entity) return false;

  return (
    Boolean(entity.metadata.annotations?.['harness.io/project-url']) &&
    !Boolean(entity.metadata.annotations?.['harness.io/service-tags']) &&
    !Boolean(entity.metadata.annotations?.['harness.io/application-map-tags'])
  );
};

export const isV2Compatible = (entity: Entity | undefined): boolean => {
  if (!entity) return false;

  return (
    Boolean(entity.metadata.annotations?.['harness.io/project-url']) &&
    (Boolean(entity.metadata.annotations?.['harness.io/service-tags']) ||
      Boolean(entity.metadata.annotations?.['harness.io/application-map-tags']))
  );
};
