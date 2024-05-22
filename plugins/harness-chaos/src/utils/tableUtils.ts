import { cloneDeep } from 'lodash-es';
import { RecentWorkflowRun, ExperimentRunStatus } from '../api/types';

export function orderExecutions(
  data: RecentWorkflowRun[],
): RecentWorkflowRun[] {
  let recentExecutions: RecentWorkflowRun[] = cloneDeep(data);
  if (recentExecutions.length < 10) {
    const fillExecutions = Array(10 - recentExecutions.length).fill({
      phase: ExperimentRunStatus.NA,
    });
    recentExecutions = [...recentExecutions, ...fillExecutions];
  }
  return recentExecutions.reverse();
}

export function getInfraIconColor(isActive: boolean | undefined) {
  if (isActive) return 'success';
  return 'error';
}
