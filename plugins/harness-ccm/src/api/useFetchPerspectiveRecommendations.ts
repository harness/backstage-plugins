import {
  PerspectiveRecommendationsQuery,
  PerspectiveRecommendationsQueryVariables,
} from './types';
import useFetcher, { AsyncStatus } from '../hooks/useFetcher';
import { fetchPerspectiveRecommendationsQuery } from '../gql/fetchPerspectiveRecommendations';

interface UseFetchPerspectiveRecommendationsProps {
  accountId: string;
  variables: Partial<PerspectiveRecommendationsQueryVariables>;
  env: string;
  backendBaseUrl: Promise<string>;
}

interface UseFetchPerspectiveRecommendationsReturn {
  perspectiveRecommendations: PerspectiveRecommendationsQuery | undefined;
  status: AsyncStatus;
  error: Error | undefined;
  loading: boolean;
  refetch: () => void;
}

const useFetchPerspectiveRecommendations = ({
  ...props
}: UseFetchPerspectiveRecommendationsProps): UseFetchPerspectiveRecommendationsReturn => {
  const body = JSON.stringify({
    query: fetchPerspectiveRecommendationsQuery,
    variables: props.variables,
  });

  const { data, ...fetcherProps } = useFetcher<{
    data: PerspectiveRecommendationsQuery;
  }>({
    ...props,
    method: 'POST',
    body,
  });

  return { perspectiveRecommendations: data?.data, ...fetcherProps };
};

export default useFetchPerspectiveRecommendations;
