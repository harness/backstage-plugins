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

const usePipelineSlugEntity = () => {
  const { entity } = useEntity();
  const isNewAnnotationPresent =
    Boolean(entity.metadata.annotations?.['harness.io/pipelines']) ||
    Boolean(entity.metadata.annotations?.['harness.io/services']);

  const harnessPipelineObject = convertStringToObject(
    entity.metadata.annotations?.['harness.io/pipelines'],
  );

  const harnessServicesObject = convertStringToObject(
    entity.metadata.annotations?.['harness.io/services'],
  );

  return {
    isNewAnnotationPresent,
    harnessPipelineObject,
    harnessServicesObject,
  };
};

export default usePipelineSlugEntity;
