import { cloneDeep } from 'lodash-es';
import { RecentWorkflowRun, ExperimentRunStatus } from '../api/types';

export function orderExecutions(
  data: RecentWorkflowRun[],
): RecentWorkflowRun[] {
  let recentExecutions: RecentWorkflowRun[] = cloneDeep(data);
  if (!recentExecutions?.length) recentExecutions = [];
  if (recentExecutions?.length < 10) {
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

export function getResilienceScoreColor(score: number | undefined) {
  if (score === undefined || score < 0) return '#9e9e9e';
  if (score >= 70) return '#4dc952';
  if (score >= 40) return '#ff832b';
  return '#da291d';
}

/** Latest run's score, or undefined when the run has no usable score (null, NaN or negative). */
export function getLatestScore(
  runs: RecentWorkflowRun[] | undefined,
): number | undefined {
  const raw = runs?.[0]?.resiliencyScore;
  if (raw === null || raw === undefined) return undefined;
  const score = Number(raw);
  return Number.isNaN(score) || score < 0 ? undefined : score;
}
