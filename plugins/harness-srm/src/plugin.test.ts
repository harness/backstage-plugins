import { harnessSrmPlugin } from './plugin';

describe('harness-srm', () => {
  it('should export plugin', () => {
    expect(harnessSrmPlugin).toBeDefined();
  });
});
