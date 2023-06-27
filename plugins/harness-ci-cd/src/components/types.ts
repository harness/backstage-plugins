export interface TableData {
  id: string;
  name: string;
  status: string;
  startTime: string;
  endTime: string;
  pipelineId: string;
  planExecutionId: string;
  runSequence: string;
  commitId: string;
  commitlink: string;
  branch: string;
  message: string;
  sourcebranch: string;
  targetbranch: string;
  prmessage: string;
  prlink: string;
  prId: string;
  cdenv?: string;
  cdser?: string;
  reponame: string;
  tag: string;
}

export enum AsyncStatus {
  Init,
  Loading,
  Success,
  Error,
  Unauthorized,
}
