import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import { useState } from 'react';
import { AsyncStatus } from '../types';
import { getSecureHarnessKey } from '../utils/getHarnessToken';

interface useGetFeatureEnvArgs {
  backendBaseUrl: Promise<string>;
  accountId: string;
  orgId: string;
  projectId: string;
  refresh: boolean;
  envFromUrl: string;
}
const useGetFeatureEnv = ({
  backendBaseUrl,
  accountId,
  orgId,
  projectId,
  refresh,
  envFromUrl,
}: useGetFeatureEnvArgs) => {
  const [ffEnvIds, setffEnvIds] = useState<string[]>([]);
  const [status, setStatus] = useState<AsyncStatus>(AsyncStatus.Init);

  useAsyncRetry(async () => {
    setStatus(AsyncStatus.Loading);

    const token = getSecureHarnessKey('token');

    const headers = new Headers({
      'content-type': 'application/json',
      Authorization: token ? `${token}` : '',
    });
    const resp = await fetch(
      `${await backendBaseUrl}/harness/${envFromUrl}/gateway/ng/api/environments?accountId=${accountId}&routingId=${accountId}&orgIdentifier=${orgId}&projectIdentifier=${projectId}`,
      {
        headers,
      },
    );
    if (resp.status === 200) {
      const data = await resp.json();
      setffEnvIds(data?.data?.content.map((obj: any) => obj.identifier));
      setStatus(AsyncStatus.Success);
    } else if (resp.status === 401) {
      setStatus(AsyncStatus.Unauthorized);
    } else {
      setStatus(AsyncStatus.Error);
    }
  }, [accountId, orgId, projectId, refresh, envFromUrl]);

  return { ffEnvIds, status };
};

export default useGetFeatureEnv;
