import { useState } from 'react';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import { AsyncStatus } from '../components/types';
import { getSecureHarnessKey } from '../util/getHarnessToken';

interface useGetExecutionsListProps {
  accountId: string;
  orgId: string;
  currProject: string | undefined;
  pageSize: number;
  page: number;
  pipelineId: string | undefined;
  serviceId: string | undefined;
  env: string;
  refresh: boolean;
  backendBaseUrl: Promise<string>;
}
const useGetExecutionsList = ({
  accountId,
  orgId,
  currProject,
  pageSize,
  page,
  pipelineId,
  serviceId,
  env,
  backendBaseUrl,
  refresh,
}: useGetExecutionsListProps) => {
  const [status, setStatus] = useState(AsyncStatus.Init);
  const [currTableData, setCurrTableData] = useState<any[]>([]);
  const [totalElements, setTotalElements] = useState(50);
  const [flag, setFlag] = useState(false);

  useAsyncRetry(async () => {
    const query = new URLSearchParams({
      accountIdentifier: `${accountId}`,
      routingId: `${accountId}`,
      orgIdentifier: `${orgId}`,
      projectIdentifier: `${currProject}`,
      size: `${pageSize}`,
      page: `${page}`,
    });

    const token = getSecureHarnessKey('token');
    const value = token ? `${token}` : '';

    const headers = new Headers({
      'content-type': 'application/json',
      Authorization: value,
    });
    let body;
    if (serviceId) {
      body = JSON.stringify({
        filterType: 'PipelineExecution',
        moduleProperties: {
          cd: {
            serviceIdentifiers: [
              serviceId?.split(',').map((item: string) => item.trim())[0],
            ],
          },
        },
      });
    }

    const identifiers: string[] = [];
    if (pipelineId && pipelineId.trim()) {
      pipelineId.split(',').forEach(item => {
        const trimmedString = item.trim();
        if (trimmedString) {
          identifiers.push(trimmedString);
        }
      });
      body = JSON.stringify({
        filterType: 'PipelineExecution',
        pipelineIdentifiers: identifiers,
      });
    }

    setStatus(AsyncStatus.Loading);

    const response = await fetch(
      `${await backendBaseUrl}/harness/${env}/gateway/pipeline/api/pipelines/execution/summary?${query}`,
      {
        headers,
        method: 'POST',
        body: body,
      },
    );

    const getBuilds = (tableData: any, currentPageSize: number): Array<{}> => {
      return tableData.map((dataItem: any, index: number) => {
        let serviceString = '';
        let envString = '';

        const request =
          typeof dataItem?.moduleInfo?.ci?.ciExecutionInfoDTO?.pullRequest ===
          'undefined'
            ? 'branch'
            : 'pullRequest';

        if (dataItem?.modules?.includes('cd')) {
          const serviceNames = new Set();
          const envNames = new Set();
          const mapdata = dataItem?.layoutNodeMap;

          Object.keys(mapdata).forEach(key => {
            if (mapdata[key].nodeType === 'Deployment') {
              if (mapdata[key]?.moduleInfo?.cd?.infraExecutionSummary?.name)
                envNames.add(
                  mapdata[key]?.moduleInfo?.cd?.infraExecutionSummary?.name,
                );
              if (mapdata[key]?.moduleInfo?.cd?.serviceInfo?.displayName)
                serviceNames.add(
                  mapdata[key]?.moduleInfo?.cd?.serviceInfo?.displayName,
                );
            }
          });
          envString = Array.from(envNames).join(',');
          serviceString = Array.from(serviceNames).join(',');
        }

        return {
          id: `${page * currentPageSize + index + 1}`,
          name: `${dataItem?.name}`,
          status: `${dataItem?.status}`,
          startTime: `${dataItem?.startTs}`,
          endTime: `${dataItem?.endTs}`,
          pipelineId: `${dataItem?.pipelineIdentifier}`,
          planExecutionId: `${dataItem?.planExecutionId}`,
          runSequence: `${dataItem?.runSequence}`,
          commitId: `${dataItem?.moduleInfo?.ci?.ciExecutionInfoDTO?.[request]?.commits?.['0']?.id}`,
          commitlink: `${dataItem?.moduleInfo?.ci?.ciExecutionInfoDTO?.[request]?.commits?.['0']?.link}`,
          branch: `${dataItem?.moduleInfo?.ci?.branch}`,
          message: `${dataItem?.moduleInfo?.ci?.ciExecutionInfoDTO?.[request]?.commits?.['0']?.message}`,
          prmessage: `${dataItem?.moduleInfo?.ci?.ciExecutionInfoDTO?.pullRequest?.title}`,
          prlink: `${dataItem?.moduleInfo?.ci?.ciExecutionInfoDTO?.pullRequest?.link}`,
          sourcebranch: `${dataItem?.moduleInfo?.ci?.ciExecutionInfoDTO?.pullRequest?.sourceBranch}`,
          targetbranch: `${dataItem?.moduleInfo?.ci?.ciExecutionInfoDTO?.pullRequest?.targetBranch}`,
          prId: `${dataItem?.moduleInfo?.ci?.ciExecutionInfoDTO?.pullRequest?.id}`,
          cdenv: `${envString}`,
          cdser: `${serviceString}`,
          reponame: `${dataItem?.moduleInfo?.ci?.repoName}`,
          tag: `${dataItem?.moduleInfo?.ci?.tag}`,
        };
      });
    };

    if (response.status === 200) {
      const data = await response.json();
      setStatus(AsyncStatus.Success);
      const responseData = data.data.content;
      if (data.data.totalElements < 50) {
        setTotalElements(data.data.totalElements);
      }
      setCurrTableData(getBuilds(responseData, pageSize));
    } else if (response.status === 401) setStatus(AsyncStatus.Unauthorized);
    else setStatus(AsyncStatus.Error);

    setFlag(true);
  }, [
    refresh,
    page,
    pageSize,
    accountId,
    orgId,
    currProject,
    pipelineId,
    serviceId,
    env,
  ]);

  return { status, currTableData, totalElements, flag };
};

export default useGetExecutionsList;
