import { getSecureHarnessKey } from '../util/getHarnessToken';
import { TableData } from '../components/types';
import { useBackstageToken } from './useBackstageToken';

interface useMutateRunPipelineProps {
  backendBaseUrl: Promise<string>;
  env: string;
}

const useMutateRunPipeline = ({
  backendBaseUrl,
  env,
}: useMutateRunPipelineProps) => {
  const token = useBackstageToken();
  const runPipeline = async (row: TableData, query1: string) => {
    const headers = new Headers({
      Authorization: `Bearer ${token.value}`,
    });

    const response = await fetch(
      `${await backendBaseUrl}/harness/${env}/gateway/pipeline/api/pipelines/execution/${
        row.planExecutionId
      }/inputset?${query1}`,
      {
        headers,
      },
    );

    const data = await response.text();

    return await fetch(
      `${await backendBaseUrl}/harness/${env}/gateway/pipeline/api/pipeline/execute/rerun/${
        row.planExecutionId
      }/${row.pipelineId}?${query1}&moduleType=ci`,
      {
        headers: new Headers({
          'content-type': 'application/yaml',
          Authorization: `Bearer ${token}`,
        }),
        body: `${data}`,
        method: 'POST',
      },
    );
  };

  return { runPipeline };
};

export default useMutateRunPipeline;
