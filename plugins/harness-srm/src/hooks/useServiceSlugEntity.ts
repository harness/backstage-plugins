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

const useServiceSlugEntity = () => {
    const { entity } = useEntity();

    const harnessServicesObject = convertStringToObject(
        entity.metadata.annotations?.['harness.io/services'],
    );

    return {
        harnessServicesObject,
    };
};

export default useServiceSlugEntity;