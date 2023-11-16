import { useState } from 'react';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import { AsyncStatus } from '../components/types';
import { getSecureHarnessKey } from '../util/getHarnessToken';

interface useGetMonitoredServiceListProps {
  accountId: string;
  orgId: string;
  currProject: string | undefined;
  serviceId: string | undefined;
  env: string;
  backendBaseUrl: Promise<string>;
}
const useGetMonitoredServiceList = ({
  accountId,
  orgId,
  currProject,
  serviceId,
  env,
  backendBaseUrl,
}: useGetMonitoredServiceListProps) => {
  const [status, setStatus] = useState(AsyncStatus.Init);
  const [currTableData, setCurrTableData] = useState<any[]>([]);
  const [flag, setFlag] = useState(false);

  useAsyncRetry(async () => {

    const token = getSecureHarnessKey('token');
    const value = token ? `${token}` : '';

    const headers = new Headers({
      'content-type': 'application/json',
      Authorization: value,
    });

    setStatus(AsyncStatus.Loading);

    const response = await fetch(
      `${await backendBaseUrl}/harness/${env}/gateway/cv/api/monitored-service?routingId=${accountId}&offset=0&pageSize=30&accountId=${accountId}&orgIdentifier=${orgId}&projectIdentifier=${currProject}&filter=&servicesAtRiskFilter=false&serviceIdentifier=${serviceId}`,
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
          identifier: `${dataItem?.identifier}`,
          environmentName: `${dataItem?.environmentName}`,
          environmentRef: `${dataItem?.environmentRef}`,
          serviceName: `${dataItem?.serviceName}`,
          serviceRef: `${dataItem?.serviceRef}`,
          changeSummary: dataItem?.changeSummary,
          currentHealthScore: dataItem?.currentHealthScore,
          sloHealthIndicators: dataItem?.sloHealthIndicators
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
    currProject,
    serviceId,
    env,
  ]);
  return { status, currTableData, flag };
};


export default useGetMonitoredServiceList;

