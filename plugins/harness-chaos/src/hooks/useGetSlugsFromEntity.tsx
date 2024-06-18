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

export const useGetServiceEntity = () => {
  const { entity } = useEntity();

  const harnessChaosServiceObject = convertStringToObject(
    entity.metadata.annotations?.['harness.io/service-tags'],
  );

  return harnessChaosServiceObject;
};

export const useGetNetworkMapEntity = () => {
  const { entity } = useEntity();

  const harnessChaosNMObject = convertStringToObject(
    entity.metadata.annotations?.['harness.io/network-map-tags'],
  );

  return harnessChaosNMObject;
};
