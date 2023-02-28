import { harnessFeatureFlagsPlugin } from './plugin';

describe('harness-feature-flags', () => {
  it('should export plugin', () => {
    expect(harnessFeatureFlagsPlugin).toBeDefined();
  });
});
