import {
  FetchperspectiveGridQuery,
  FetchperspectiveGridQueryVariables,
} from './types';
import useFetcher, { AsyncStatus } from '../hooks/useFetcher';
import { fetchPerspectiveGridQuery } from '../gql/fetchPerspectiveGrid';

interface UseFetchPerspectiveGridProps {
  accountId: string;
  variables: Partial<FetchperspectiveGridQueryVariables>;
  env: string;
  backendBaseUrl: Promise<string>;
}

interface UseFetchPerspectiveGridReturn {
  perspectiveGrid: FetchperspectiveGridQuery | undefined;
  status: AsyncStatus;
  error: Error | undefined;
  loading: boolean;
  refetch: () => void;
}

const useFetchPerspectiveGrid = ({
  ...props
}: UseFetchPerspectiveGridProps): UseFetchPerspectiveGridReturn => {
  const body = JSON.stringify({
    query: fetchPerspectiveGridQuery,
    variables: props.variables,
  });

  const { data, ...fetcherProps } = useFetcher<{
    data: FetchperspectiveGridQuery;
  }>({
    ...props,
    method: 'POST',
    body,
  });

  return { perspectiveGrid: data?.data, ...fetcherProps };
};

export default useFetchPerspectiveGrid;
