import useAsyncRetry from 'react-use/lib/useAsyncRetry';

import { ExperimentFilterRequest, ListWorkflowResponse } from './types';
import { getSecureHarnessKey } from '../utils/getHarnessToken';
import { getLatestScore } from '../utils/tableUtils';
import { listExperimentScoresQuery } from '../gql/listExperimentScoresQuery';

const PAGE_SIZE = 100;
const MAX_PAGES = 100; // PAGE_SIZE * MAX_PAGES = 10000 experiments

interface UseAverageResilienceScoreProps {
  accountId: string;
  orgId: string;
  projectId: string;
  env: string;
  backendBaseUrl: Promise<string>;
  filter?: ExperimentFilterRequest;
}

export interface ResilienceSummary {
  /** undefined when no experiment has a score (shown as N/A) */
  average: number | undefined;
  /** experiments with a valid score */
  scored: number;
  /** all experiments matching the filter */
  total: number;
}

interface UseAverageResilienceScoreReturn {
  summary: ResilienceSummary | undefined;
  error: Error | undefined;
  loading: boolean;
  refetch: () => void;
}

/**
 * Summary (average, scored count, total) of the latest resilience score across every experiment matching the
 * filter (not just the visible page). Experiments without a score are ignored.
 */
const useAverageResilienceScore = ({
  accountId,
  orgId,
  projectId,
  env,
  backendBaseUrl,
  filter,
}: UseAverageResilienceScoreProps): UseAverageResilienceScoreReturn => {
  const filterKey = JSON.stringify(filter);

  const {
    value: summary,
    loading,
    error,
    retry: refetch,
  } = useAsyncRetry(async (): Promise<ResilienceSummary | undefined> => {
    const token = getSecureHarnessKey('token');
    const headers = new Headers({
      'content-type': 'application/json',
      Authorization: token ? `${token}` : '',
    });
    const url = `${await backendBaseUrl}/harness/${env}/gateway/chaos/manager/api/query?${new URLSearchParams(
      { routingId: accountId },
    )}`;

    const scores: number[] = [];
    let fetched = 0;
    let total = 0;
    for (let page = 0; page < MAX_PAGES; page++) {
      const response = await fetch(url, {
        headers,
        method: 'POST',
        body: JSON.stringify({
          query: listExperimentScoresQuery,
          variables: {
            identifiers: {
              accountIdentifier: accountId,
              orgIdentifier: orgId,
              projectIdentifier: projectId,
            },
            request: { pagination: { page, limit: PAGE_SIZE }, filter },
          },
        }),
      });
      if (response.status !== 200) {
        throw new Error(
          `Failed to load resilience scores (HTTP ${response.status})`,
        );
      }

      const result: ListWorkflowResponse = await response.json();
      const list = result?.data?.listWorkflow;
      const workflows = list?.workflows ?? [];
      total = list?.totalNoOfWorkflows ?? 0;

      fetched += workflows.length;
      workflows.forEach(workflow => {
        const score = getLatestScore(workflow.recentWorkflowRunDetails);
        if (score !== undefined) scores.push(score);
      });
      if (!workflows.length || (page + 1) * PAGE_SIZE >= total) break;
    }

    return {
      average: scores.length
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : undefined,
      scored: scores.length,
      total: fetched,
    };
  }, [accountId, orgId, projectId, env, filterKey]);

  return { summary, error, loading, refetch };
};

export default useAverageResilienceScore;
