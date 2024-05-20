import { listExperimentsQuery } from '../gql/listExperimentsQuery';
import useFetcher, { AsyncStatus } from '../hooks/useFetcher';
import { ListWorkflowResponse, Workflow } from './types';

interface UseGetExperimentsListProps {
  accountId: string;
  orgId: string;
  projectId: string;
  limit?: number;
  page?: number;
  infrastructures?: string[];
  env: string;
  backendBaseUrl: Promise<string>;
}

interface UseGetExperimentsListReturn {
  experiments: Workflow[] | undefined;
  totalExperiments: number;
  status: AsyncStatus;
  error: Error | undefined;
  loading: boolean;
  refetch: () => void;
}

const useGetExperimentsList = ({
  page = 0,
  limit = 15,
  ...props
}: UseGetExperimentsListProps): UseGetExperimentsListReturn => {
  const body = JSON.stringify({
    query: listExperimentsQuery,
    variables: {
      identifiers: {
        accountIdentifier: props.accountId,
        orgIdentifier: props.orgId,
        projectIdentifier: props.projectId,
      },
      request: {
        pagination: {
          page: page,
          limit: limit,
        },
        filter: {
          infraTypes: props.infrastructures,
        },
      },
    },
  });

  const { data, ...fetcherProps } = useFetcher<ListWorkflowResponse>({
    ...props,
    method: 'POST',
    body,
  });

  const experiments = data?.data.listWorkflow.workflows;
  const totalExperiments = data?.data.listWorkflow.totalNoOfWorkflows || 0;

  return { experiments, totalExperiments, ...fetcherProps };
};

export default useGetExperimentsList;
