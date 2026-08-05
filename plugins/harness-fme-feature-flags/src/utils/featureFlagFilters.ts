import { Feature, FeatureStatus, FlagSet } from '../types';

export const featureFlagFilterAnnotations = {
  flagSets: 'harnessfme/filter-flag-sets',
  tags: 'harnessfme/filter-tags',
  flags: 'harnessfme/filter-flags',
} as const;

export interface FeatureFlagFilterCriteria {
  flagSets: string[];
  tags: string[];
  /**
   * Feature identifier allowlist. Values are matched against `Feature.name`.
   */
  featureNames: string[];
}

type FeatureFlagSetReference = {
  id?: unknown;
};

const normalizeValue = (value: string) => value.trim();

const matchesAny = (values: readonly string[], filters: readonly string[]) => {
  if (filters.length === 0) {
    return true;
  }

  const normalizedValues = new Set(
    values.map(normalizeValue).filter(value => value.length > 0),
  );

  return filters.some(filter => normalizedValues.has(filter));
};

/**
 * Parses a comma- or newline-delimited annotation value into unique, non-empty
 * filter values. Matching remains case-sensitive.
 */
export const parseFeatureFlagFilterValues = (
  annotationValue?: string,
): string[] => {
  if (!annotationValue) {
    return [];
  }

  return Array.from(
    new Set(
      annotationValue
        .split(/[,\n]/)
        .map(normalizeValue)
        .filter(value => value.length > 0),
    ),
  );
};

/**
 * Builds feature-flag filtering criteria from optional entity annotations.
 */
export const parseFeatureFlagFilterCriteria = (
  annotations?: Readonly<Record<string, string | undefined>>,
): FeatureFlagFilterCriteria => ({
  flagSets: parseFeatureFlagFilterValues(
    annotations?.[featureFlagFilterAnnotations.flagSets],
  ),
  tags: parseFeatureFlagFilterValues(
    annotations?.[featureFlagFilterAnnotations.tags],
  ),
  featureNames: parseFeatureFlagFilterValues(
    annotations?.[featureFlagFilterAnnotations.flags],
  ),
});

const getFlagSetReferenceIds = (feature: Feature): string[] => {
  if (!Array.isArray(feature.flagSets)) {
    return [];
  }

  return feature.flagSets.reduce<string[]>((ids, flagSet) => {
    if (typeof flagSet === 'string') {
      ids.push(flagSet);
      return ids;
    }

    if (typeof flagSet !== 'object' || flagSet === null) {
      return ids;
    }

    const { id } = flagSet as FeatureFlagSetReference;
    if (typeof id === 'string') {
      ids.push(id);
    }

    return ids;
  }, []);
};

/**
 * Returns features that satisfy every populated category. Values within a
 * category are alternatives, while flag sets, tags, and feature identifiers
 * are combined with AND semantics.
 */
export const filterFeaturesByCriteria = (
  features: readonly Feature[],
  criteria: FeatureFlagFilterCriteria,
  featureStatusByName: Readonly<Record<string, FeatureStatus>>,
  flagSetsById: Readonly<Record<string, FlagSet>>,
): Feature[] =>
  features.filter(feature => {
    const featureName = feature.name?.trim() ?? '';
    const featureStatus = featureStatusByName[featureName];
    const flagSetValues = getFlagSetReferenceIds(feature).reduce<string[]>(
      (values, flagSetId) => {
        const normalizedId = flagSetId.trim();
        const flagSetName = flagSetsById[normalizedId]?.name;

        values.push(normalizedId);
        if (flagSetName !== undefined) {
          values.push(flagSetName);
        }

        return values;
      },
      [],
    );
    const tagValues = featureStatus?.tags?.map(tag => tag.name) ?? [];

    return (
      matchesAny(flagSetValues, criteria.flagSets) &&
      matchesAny(tagValues, criteria.tags) &&
      matchesAny(featureName ? [featureName] : [], criteria.featureNames)
    );
  });
