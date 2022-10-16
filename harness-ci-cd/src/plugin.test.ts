import { harnessCiCdPlugin } from './plugin';

describe('harness-ci-cd', () => {
  it('should export plugin', () => {
    expect(harnessCiCdPlugin).toBeDefined();
  });
});
