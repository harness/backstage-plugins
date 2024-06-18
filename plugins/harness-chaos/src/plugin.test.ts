import { harnessChaosPlugin } from './plugin';

describe('harness-chaos', () => {
  it('should export plugin', () => {
    expect(harnessChaosPlugin).toBeDefined();
  });
});
