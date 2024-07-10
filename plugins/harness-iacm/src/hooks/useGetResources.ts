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
  workspace: string | null;
  envFromUrl?: string;
}

export interface Resource {
  id: string;
  provider: string;
  type: string;
  name: string;
  module: string;
  attributes: {
    ami: string;
    arn: string;
    associate_public_ip_address: string;
    availability_zone: string;
  };
}
export interface ResourcesResponse {
  resources: { resources: Resource[] | null };
  status: AsyncStatus;
}

const useGetResources = ({
  backendBaseUrl,
  accountId,
  orgId,
  projectId,
  refresh,
  envFromUrl,
  workspace,
}: useGetFeatureEnvArgs): ResourcesResponse => {
  const [resources, setResources] = useState<Resource[] | null>(null);
  const [status, setStatus] = useState<AsyncStatus>(AsyncStatus.Init);

  useAsyncRetry(async () => {
    setStatus(AsyncStatus.Loading);

    const token = getSecureHarnessKey('token');
    const headers = new Headers({
      'content-type': 'application/json',
      Authorization: token ? `${token}` : '',
      'Harness-Account': accountId, 
    });
    if (!workspace) {
      return;
    }
    const resp = await fetch(
      `${await backendBaseUrl}/harness/${envFromUrl}/gateway/iacm/api/orgs/${orgId}/projects/${projectId}/workspaces/${workspace}/resources&accountId=${accountId}`,
      {
        headers,
      },
    );
    if (resp.status === 200) {
      const data = await resp.json();

      const dataWithId = {
        ...data,
        resources: (data.resources as Resource[]).map(
          (resource: Resource, index) => ({
            ...resource,
            id: new Date().getTime().toString() + index.toString(),
          }),
        ),
      };

      setResources(dataWithId);
      setStatus(AsyncStatus.Success);
    } else if (resp.status === 401) {
      setStatus(AsyncStatus.Unauthorized);
    } else {
      setStatus(AsyncStatus.Error);
    }
  }, [accountId, orgId, projectId, refresh, envFromUrl, workspace]);

  return { resources: resources as any, status };
};

export default useGetResources;
