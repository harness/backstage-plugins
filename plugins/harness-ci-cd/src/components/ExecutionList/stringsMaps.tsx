import {
  StatusRunning,
  StatusError,
  StatusOK,
  StatusAborted,
  StatusWarning,
} from '@backstage/core-components';
import React from 'react';

export const getStatusComponent = (status: string | undefined = '') => {
  switch (status.toLocaleLowerCase('en-US')) {
    case 'running':
      return <StatusRunning />;
    case 'failed':
      return <StatusError />;
    case 'success':
      return <StatusOK />;
    case 'aborted':
      return <StatusAborted />;
    case 'skipped':
      return <StatusAborted />;
    default:
      return <StatusWarning />;
  }
};

export const stringsMap: Record<string, string> = {
  Aborted: 'Aborted',
  Discontinuing: 'Aborted',
  Running: 'Running',
  AsyncWaiting: 'Running',
  TaskWaiting: 'Running',
  TimedWaiting: 'Running',
  Failed: 'Failed',
  Errored: 'Failed',
  NotStarted: 'NotStarted',
  Expired: 'Expired',
  Queued: 'Queued',
  Paused: 'Paused',
  ResourceWaiting: 'Waiting',
  Skipped: 'Skipped',
  Success: 'Success',
  IgnoreFailed: 'Success',
  Suspended: 'Suspended',
  Pausing: 'Pausing',
  ApprovalRejected: 'ApprovalRejected',
  InterventionWaiting: 'Waiting',
  ApprovalWaiting: 'ApprovalWaiting',
  InputWaiting: 'Waiting',
  WaitStepRunning: 'Waiting',
};
