export type ListExperimentsResponse = {
  data: {
    listWorkflow: {
      workflows: Experiment[];
      totalNoOfWorkflows: number;
    };
  };
};

export type Experiment = {
  workflowID: string;
  name: string;
  workflowType: string;
  cronSyntax: string;
  infra: {
    infraID: string;
    infraType: string;
    name: string;
    environmentID: string;
    infraNamespace: string;
    infraScope: string;
    isActive: boolean;
  };
  recentWorkflowRunDetails: RecentExecutions[];
};

export type RecentExecutions = {
  workflowRunID: string;
  resiliencyScore: number | null;
  phase: ExperimentRunStatus;
  updatedAt: string;
  updatedBy: UserDetails;
};

export interface UserDetails {
  userID: string;
  username: string;
  email: string;
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
