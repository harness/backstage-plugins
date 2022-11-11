export interface Config {
  /** Configurations for the Harness plugin */
  harness: {
    /**
     * The base url of the Harness installation.
     * @visibility frontend
     */
    baseUrl?: string;
  };
}
