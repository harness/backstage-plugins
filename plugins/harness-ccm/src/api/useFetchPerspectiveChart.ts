import {
  FetchPerspectiveTimeSeriesQuery,
  FetchPerspectiveTimeSeriesQueryVariables,
} from './types';
import useFetcher, { AsyncStatus } from '../hooks/useFetcher';
import { fetchPerspectiveChartQuery } from '../gql/fetchPerspectiveChart';

interface UseFetchPerspectiveChartProps {
  accountId: string;
  variables: Partial<FetchPerspectiveTimeSeriesQueryVariables>;
  env: string;
  backendBaseUrl: Promise<string>;
}

interface UseFetchPerspectiveChartReturn {
  perspectiveChart: FetchPerspectiveTimeSeriesQuery | undefined;
  status: AsyncStatus;
  error: Error | undefined;
  loading: boolean;
  refetch: () => void;
}

const useFetchPerspectiveChart = ({
  ...props
}: UseFetchPerspectiveChartProps): UseFetchPerspectiveChartReturn => {
  const body = JSON.stringify({
    query: fetchPerspectiveChartQuery,
    variables: props.variables,
  });

  const { data, ...fetcherProps } = useFetcher<{
    data: FetchPerspectiveTimeSeriesQuery;
  }>({
    ...props,
    method: 'POST',
    body,
  });

  return { perspectiveChart: data?.data, ...fetcherProps };
};

export default useFetchPerspectiveChart;
