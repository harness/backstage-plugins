import { Feature, FeatureStatus, FlagSet } from '../types';
import {
  featureFlagFilterAnnotations,
  filterFeaturesByCriteria,
  parseFeatureFlagFilterCriteria,
  parseFeatureFlagFilterValues,
} from './featureFlagFilters';

const feature = (
  id: string,
  name: string,
  flagSets?: Feature['flagSets'],
): Feature => ({ id, name, flagSets });

const status = (name: string, tags: string[] | null = []): FeatureStatus => ({
  id: name,
  name,
  rolloutStatus: { name: 'Active' },
  tags: tags?.map(tag => ({ name: tag })) ?? null,
  owners: [],
  creationTime: '',
});

const flagSet = (id: string, name: string): FlagSet => ({
  id,
  type: 'feature_flag_set',
  name,
});

describe('featureFlagFilters', () => {
  it('parses comma- and newline-delimited values, trimming blanks and duplicates', () => {
    expect(
      parseFeatureFlagFilterValues(' alpha, beta\nalpha, \n gamma , beta '),
    ).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('builds criteria from filter annotations', () => {
    expect(
      parseFeatureFlagFilterCriteria({
        [featureFlagFilterAnnotations.flagSets]: 'platform',
        [featureFlagFilterAnnotations.tags]: 'critical',
        [featureFlagFilterAnnotations.flags]: 'release-dashboard',
      }),
    ).toEqual({
      flagSets: ['platform'],
      tags: ['critical'],
      featureNames: ['release-dashboard'],
    });
  });

  it('returns all flags when no filter criteria are present', () => {
    const features = [feature('1', 'alpha'), feature('2', 'beta')];

    expect(
      filterFeaturesByCriteria(
        features,
        parseFeatureFlagFilterCriteria(),
        {},
        {},
      ),
    ).toEqual(features);
  });

  it('treats null tags as empty without throwing', () => {
    const features = [feature('1', 'alpha')];
    const featureStatuses = { alpha: status('alpha', null) };

    expect(
      filterFeaturesByCriteria(
        features,
        parseFeatureFlagFilterCriteria(),
        featureStatuses,
        {},
      ),
    ).toEqual(features);

    expect(
      filterFeaturesByCriteria(
        features,
        {
          flagSets: [],
          tags: ['critical'],
          featureNames: [],
        },
        featureStatuses,
        {},
      ),
    ).toEqual([]);
  });

  it('matches explicit flags against Feature.name with case-sensitive exact values', () => {
    const features = [
      feature('1', 'release-dashboard'),
      feature('2', 'Release-Dashboard'),
      feature('3', 'release-dashboard-v2'),
    ];

    expect(
      filterFeaturesByCriteria(
        features,
        parseFeatureFlagFilterCriteria({
          [featureFlagFilterAnnotations.flags]: 'release-dashboard',
        }),
        {},
        {},
      ),
    ).toEqual([features[0]]);
  });

  it('ORs values within tags and flag sets, resolving flag-set IDs and names', () => {
    const features = [
      feature('1', 'by-id', [{ id: 'release-set' }]),
      feature('2', 'by-name', ['growth-set']),
      feature('3', 'not-a-match', ['other-set']),
    ];

    expect(
      filterFeaturesByCriteria(
        features,
        {
          flagSets: ['release-set', 'Growth'],
          tags: ['critical', 'canary'],
          featureNames: [],
        },
        {
          'by-id': status('by-id', ['critical']),
          'by-name': status('by-name', ['canary']),
          'not-a-match': status('not-a-match', ['internal']),
        },
        {
          'release-set': flagSet('release-set', 'Release'),
          'growth-set': flagSet('growth-set', 'Growth'),
          'other-set': flagSet('other-set', 'Other'),
        },
      ),
    ).toEqual([features[0], features[1]]);
  });

  it('ANDs active categories and excludes flags missing required metadata', () => {
    const features = [
      feature('1', 'matches', ['release-set']),
      feature('2', 'missing-tags', ['release-set']),
      feature('3', 'missing-flag-set'),
      feature('4', 'wrong-tag', ['release-set']),
    ];

    expect(
      filterFeaturesByCriteria(
        features,
        {
          flagSets: ['release-set'],
          tags: ['critical'],
          featureNames: [],
        },
        {
          matches: status('matches', ['critical']),
          'missing-flag-set': status('missing-flag-set', ['critical']),
          'wrong-tag': status('wrong-tag', ['internal']),
        },
        {
          'release-set': flagSet('release-set', 'Release'),
        },
      ),
    ).toEqual([features[0]]);
  });
});
