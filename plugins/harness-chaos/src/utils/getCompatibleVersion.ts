import { Entity } from '@backstage/catalog-model';

const hasProjectUrl = (entity: Entity) =>
  Boolean(entity.metadata.annotations?.['harness.io/project-url']);

const hasApplicationMapTags = (entity: Entity) =>
  Boolean(
    entity.metadata.annotations?.['harness.io/application-map-tags']?.trim(),
  );

export const isV1Compatible = (entity: Entity | undefined): boolean => {
  if (!entity) return false;

  return hasProjectUrl(entity) && !hasApplicationMapTags(entity);
};

export const isV2Compatible = (entity: Entity | undefined): boolean => {
  if (!entity) return false;

  return hasProjectUrl(entity) && hasApplicationMapTags(entity);
};
