export interface Config {
  /** Configurations for the Harness plugin */
  harnessfme?: {
    /**
     * The base url of the Harness installation. Defaults to `https://app.split.io/`.
     * @visibility frontend
     */
    baseUrl?: string;
  };
}
