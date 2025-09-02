export enum AsyncStatus {
  Init,
  Loading,
  Success,
  Error,
  Unauthorized,
}

export interface TableData {
  id: string;
  name?: string;
  lastUpdateTime?: any;
  creationTime?: any;
  killed?: boolean;
  trafficType?: any;
  defaultTreatment?: string;
  lastTrafficReceivedAt?: any;
  flagSets?: any;
}
export interface Feature {
  id: string;
  name?: string;
  lastUpdateTime?: any;
  creationTime?: any;
  killed?: boolean;
  trafficType?: any;
  defaultTreatment?: string;
  lastTrafficReceivedAt?: any;
  flagSets?: any;
}

export interface FeatureStatus {
  id: string;
  name: string;
  rolloutStatus: {
    name: string;
  };
  tags: {
    name: string;
  }[];
  owners: { id: string; type: string }[];
  creationTime: string;
}

export interface HarnessGroup {
  identifier: string;
  name: string;
}

export interface HarnessUser {
  uuid: string;
  name: string;
  email: string;
}

export interface Owner {
  id: string;
  type: string;
  name: string;
  email?: string;
  identifier?: string;
}

export interface FlagSet {
  id: string;
  type: string;
  name: string;
}
