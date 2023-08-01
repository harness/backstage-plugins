import { TableData } from '../components/types';
import {
  identityApiRef,
  useApi
} from '@backstage/core-plugin-api';

interface useMutateRunPipelineProps {
  backendBaseUrl: Promise<string>;
  env: string;
}

const useMutateRunPipeline = ({
  backendBaseUrl,
  env,
}: useMutateRunPipelineProps) => {
  const identityApi = useApi(identityApiRef);
  const runPipeline = async (row: TableData, query1: string) => {
    const { token } = await identityApi.getCredentials();

    const response = await fetch(
      `${await backendBaseUrl}/harness/${env}/gateway/pipeline/api/pipelines/execution/${
        row.planExecutionId
      }/inputset?${query1}`,
      {
        headers: new Headers({
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }),
      },
    );

    const data = await response.text();

    return await fetch(
      `${await backendBaseUrl}/harness/${env}/gateway/pipeline/api/pipeline/execute/rerun/${
        row.planExecutionId
      }/${row.pipelineId}?${query1}&moduleType=ci`,
      {
        headers: new Headers({
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/yaml",
        }),
        body: `${data}`,
        method: 'POST',
      },
    );
  };

  return { runPipeline };
};

export default useMutateRunPipeline;
