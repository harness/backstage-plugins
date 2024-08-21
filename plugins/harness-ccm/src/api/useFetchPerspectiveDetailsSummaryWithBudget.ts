import {
  FetchPerspectiveDetailsSummaryWithBudgetQuery,
  FetchPerspectiveDetailsSummaryWithBudgetQueryVariables,
} from './types';
import useFetcher, { AsyncStatus } from '../hooks/useFetcher';
import { fetchPerspectiveDetailsWithBudgetSummaryQuery } from '../gql/fetchPerspectiveDetailsWithBudgetSummary';

interface UseFetchPerspectiveDetailsSummaryWithBudgetProps {
  accountId: string;
  variables: FetchPerspectiveDetailsSummaryWithBudgetQueryVariables;
  env: string;
  backendBaseUrl: Promise<string>;
}

interface UseFetchPerspectiveDetailsSummaryWithBudgetReturn {
  perspectiveSummary: FetchPerspectiveDetailsSummaryWithBudgetQuery | undefined;
  status: AsyncStatus;
  error: Error | undefined;
  loading: boolean;
  refetch: () => void;
}

const useFetchPerspectiveDetailsSummaryWithBudget = ({
  ...props
}: UseFetchPerspectiveDetailsSummaryWithBudgetProps): UseFetchPerspectiveDetailsSummaryWithBudgetReturn => {
  const body = JSON.stringify({
    query: fetchPerspectiveDetailsWithBudgetSummaryQuery,
    variables: props.variables,
  });

  const { data, ...fetcherProps } =
    useFetcher<FetchPerspectiveDetailsSummaryWithBudgetQuery>({
      ...props,
      method: 'POST',
      body,
    });

  return { perspectiveSummary: data, ...fetcherProps };
};

export default useFetchPerspectiveDetailsSummaryWithBudget;
