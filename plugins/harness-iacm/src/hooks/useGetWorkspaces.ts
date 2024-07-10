import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import { useState } from 'react';
import { AsyncStatus } from '../types';
import { getSecureHarnessKey } from '../utils/getHarnessToken';
import { Workspace } from '../components/WorkspaceList';

interface useGetFeatureEnvArgs {
  backendBaseUrl: Promise<string>;
  accountId: string;
  orgId: string;
  projectId: string;
  refresh: boolean;
  envFromUrl?: string;
}

export interface WorkspaceResponse {
  workspaces: Workspace[];
  ffEnvIds: any;
  status: any;
}

const useGetWorkspaces = ({
  backendBaseUrl,
  accountId,
  orgId,
  projectId,
  refresh,
  envFromUrl,
}: useGetFeatureEnvArgs): WorkspaceResponse => {
  const [ffEnvIds, setffEnvIds] = useState<string[]>([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [status, setStatus] = useState<AsyncStatus>(AsyncStatus.Init);

  useAsyncRetry(async () => {
    setStatus(AsyncStatus.Loading);

    const token = getSecureHarnessKey('token');
    const headers = new Headers({
      'content-type': 'application/json',
      Authorization: token ? `${token}` : '',
      'Harness-Account': accountId,
    });
    const resp = await fetch(
      `${await backendBaseUrl}/harness/${envFromUrl}/gateway/iacm/api/orgs/${orgId}/projects/${projectId}/workspaces?sort=name%2CASC&searchTerm=&page=1&limit=10`,
      {
        headers,
      },
    );

    if (resp.status === 200) {
      const data = await resp.json();
      setffEnvIds(data);
      setWorkspaces(data);
      setStatus(AsyncStatus.Success);
    } else if (resp.status === 401) {
      setStatus(AsyncStatus.Unauthorized);
    } else {
      setStatus(AsyncStatus.Error);
    }
  }, [accountId, orgId, projectId, refresh, envFromUrl]);
  return { ffEnvIds, status, workspaces };
};

export default useGetWorkspaces;
