export interface Config {
  /** Configurations for the Harness plugin */
  harness?: {
    /**
     * The base url of the Harness installation. Defaults to `https://app.harness.io/`.
     * @visibility frontend
     */
    baseUrl?: string;
  };
}
