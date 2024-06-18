export interface Identifiers {
  accountIdentifier: string;
  orgIdentifier: string;
  projectIdentifier: string;
}

export interface ResourceDetails {
  name: string;
  description?: string;
  tags?: Array<string>;
}

export interface UserDetails {
  userID: string;
  username: string;
  email: string;
}

export interface Audit {
  updatedAt?: string;
  createdAt?: string;
  updatedBy?: UserDetails;
  createdBy?: UserDetails;
  isRemoved?: boolean;
}

export enum ExperimentType {
  CRON_V2 = 'cronexperiment_v2',
  EXPERIMENT_V2 = 'experiment_v2',
  CRON = 'cronexperiment',
  NON_CRON = 'experiment',
  GAMEDAY = 'gameday',
}

export interface SRMEventsMetadata {
  faultName: string;
  serviceIdentifier: string[];
  environmentIdentifier?: string[];
}

export interface Weightages {
  experimentName: string;
  weightage: number;
}

export enum InfrastructureType {
  KUBERNETES = 'Kubernetes',
  KUBERNETESV2 = 'KubernetesV2',
  LINUX = 'Linux',
  WINDOWS = 'Windows',
}

export interface Infrastructure {
  infraID: string;
  infraType: InfrastructureType;
  name: string;
  environmentID: string;
  infraNamespace: string;
  infraScope: string;
  isActive: boolean;
}

export enum ExperimentRunStatus {
  COMPLETED = 'Completed',
  COMPLETED_WITH_ERROR = 'Completed_With_Error',
  COMPLETED_WITH_PROBE_FAILURE = 'Completed_With_Probe_Failure',
  ERROR = 'Error',
  RUNNING = 'Running',
  STOPPED = 'Stopped',
  TIMEOUT = 'Timeout',
  QUEUED = 'Queued',
  NA = 'NA',
}

export interface RecentWorkflowRun extends Audit {
  workflowRunID: string;
  notifyID: string;
  phase: ExperimentRunStatus;
  resiliencyScore: number;
}

export interface Workflow extends Audit, ResourceDetails {
  identifiers: Identifiers;
  workflowID: string;
  workflowManifest: string;
  cronSyntax: string;
  isCronEnabled: boolean;
  workflowType: ExperimentType;
  weightages: Weightages[];
  isCustomWorkflow: boolean;
  infra?: Infrastructure;
  recentWorkflowRunDetails: RecentWorkflowRun[];
  eventsMetadata: SRMEventsMetadata[];
}

export interface ListWorkflowResponse {
  data: {
    listWorkflow: {
      totalNoOfWorkflows: number;
      workflows: Array<Workflow>;
    };
  };
}

export interface DateRange {
  startDate: string;
  endDate?: string;
}

export enum ExperimentListType {
  CRON = 'CRON',
  NON_CRON = 'NON_CRON',
  GAMEDAY = 'GAMEDAY',
  ALL = 'ALL',
}

export interface ExperimentFilterRequest {
  workflowName?: string;
  infraID?: string;
  infraActive?: boolean;
  scenarioType?: ExperimentListType;
  dateRange?: DateRange;
  infraTypes?: Array<InfrastructureType>;
  tags?: Array<string>;
  isCronEnabled?: boolean;
}
