export enum AsyncStatus {
  Init,
  Loading,
  Success,
  Error,
  Unauthorized,
}

export interface TableData {
  name: string;
  archived: string;
  owner: string;
  createdAt?: any;
  modifiedAt?: string;
  kind?: string;
  identifier: string;
  status: string;
  state: string;
  pipelineConfigured: string;
}
export interface Feature {
  name?: string;
  archived?: string;
  owner?: string[];
  createdAt?: any;
  modifiedAt?: string;
  kind?: string;
  identifier?: string;
  status?: { status: any };
  envProperties?: { state: string; pipelineConfigured: string };
}

export interface FeatureStatus {
  identifier: string;
  name: string;
  results: Array<any>;
  status: {
    lastAccess: number;
    status: string;
  };
}
