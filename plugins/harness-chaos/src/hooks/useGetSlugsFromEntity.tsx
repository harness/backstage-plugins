import { useEntity } from '@backstage/plugin-catalog-react';

function convertStringToObject(inputString: string | undefined) {
  if (!inputString) return {};
  const object: Record<string, string> = {};
  const lines = inputString.split('\n');

  for (const line of lines) {
    if (line === '') continue;
    const [label, ...rest] = line.split(':');
    const trimmedLabel = label.trim();
    object[trimmedLabel] = rest.join(':').trim();
  }
  return object;
}

export const useProjectUrlFromEntity = () => {
  const { entity } = useEntity();
  return entity.metadata.annotations?.['harness.io/project-url'];
};

export const useGetNetworkMapEntity = () => {
  const { entity } = useEntity();

  const harnessChaosNMObject = convertStringToObject(
    entity.metadata.annotations?.['harness.io/application-map-tags'],
  );

  return harnessChaosNMObject;
};

/** Tag shared by an entity and its experiments, in the form `<type>=<identifier>`. */
export const useEntityTag = (): string | undefined => {
  const { entity } = useEntity();
  const entityType = entity.spec?.type;
  const identifier = entity.metadata.name;
  if (!entityType || !identifier) return undefined;
  return `${entityType}=${identifier}`;
};
