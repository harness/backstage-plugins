import { useState } from 'react';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import { AsyncStatus } from '../components/types';
import { getSecureHarnessKey } from '../util/getHarnessToken';

interface useSLOListProps {
  accountId: string;
  orgId: string;
  projectId: string | undefined;
  monitoredServiceId: string | undefined;
  env: string;
  backendBaseUrl: Promise<string>;
}
const useSLOList = ({
  accountId,
  orgId,
  projectId,
  monitoredServiceId,
  env,
  backendBaseUrl,
}: useSLOListProps) => {
  const [status, setStatus] = useState(AsyncStatus.Init);
  const [currTableData, setCurrTableData] = useState<any[]>([]);
  const [flag, setFlag] = useState(false);

  useAsyncRetry(async () => {

    const token = getSecureHarnessKey('token');
    const value = token ? `${token}` : '';

    const headers = new Headers({
      'content-type': 'application/json',
       Authorization : value
});

    setStatus(AsyncStatus.Loading);

    const response = await fetch(
      `${await backendBaseUrl}/harness/${env}/gateway/cv/api/slo-dashboard/widgets/list?routingId=${accountId}&pageNumber=0&pageSize=50&accountId=${accountId}&orgIdentifier=${orgId}&projectIdentifier=${projectId}&monitoredServiceIdentifier=${monitoredServiceId}`,
      {
        method: 'GET',
        headers,
      },
    );

    const getBuilds = (tableData: any): Array<{}> => {
      return tableData.map((dataItem: any, index: number) => {
        return {
          id: `${index + 1}`,
          name: `${dataItem?.name}`,
          sloIdentifier: `${dataItem?.sloIdentifier}`,
          evaluationType: `${dataItem?.evaluationType}`,
          userJourneyName: `${dataItem?.userJourneyName}`,
          sloTargetPercentage: `${dataItem?.sloTargetPercentage}`,
          burnRate: `${dataItem?.burnRate}`,
          errorBudgetRemainingPercentage: `${dataItem?.errorBudgetRemainingPercentage}`,
          errorBudgetRisk: `${dataItem?.errorBudgetRisk}`,
          errorBudgetRemaining:`${dataItem?.errorBudgetRemaining}`
        };
      });
    };


    
    if (response.status === 200) {
        const data = await response.json();
        setStatus(AsyncStatus.Success);
        const responseData = data.data.content;
        setCurrTableData(getBuilds(responseData));
      
    } else if (response.status === 401) setStatus(AsyncStatus.Unauthorized);
    else setStatus(AsyncStatus.Error);

    setFlag(true);
  }, [
    accountId,
    orgId,
    projectId,
    monitoredServiceId,
    env,
  ]);
  return { status, currTableData, flag };
  };


export default useSLOList;

