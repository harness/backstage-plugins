export interface Config {
  /** Configurations for the Harness plugin */
  harness?: {
    /**
     * The base url of the Harness installation. Defaults to `https://app.harness.io/`.
     * @visibility frontend
     */
    baseUrl?: string;
    /**
     * Config to disable the functionality of re-running pipelines from Backstage. Enabled by default.
     * @visibility frontend
     */
    disableRunPipeline?: boolean;
  };
}
