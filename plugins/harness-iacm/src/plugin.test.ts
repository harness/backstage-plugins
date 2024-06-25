import { harnessIacmPlugin } from './plugin';

describe('harness-iacm', () => {
  it('should export plugin', () => {
    expect(harnessIacmPlugin).toBeDefined();
  });
});
