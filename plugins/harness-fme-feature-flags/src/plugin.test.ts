import { harnessFMEFeatureFlagsPlugin } from './plugin';

describe('harness-FME-feature-flags', () => {
  it('should export plugin', () => {
    expect(harnessFMEFeatureFlagsPlugin).toBeDefined();
  });
});
