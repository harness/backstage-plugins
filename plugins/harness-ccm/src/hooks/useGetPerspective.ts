import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import { useState } from 'react';

import { getSecureHarnessKey } from '../utils/getHarnessToken';

import { AsyncStatus, CEView } from '../api/types';

interface useGetFeatureEnvArgs {
  backendBaseUrl: Promise<string>;
  accountId: string;
  envFromUrl?: string;
  perspectiveId: string;
}

export interface UseGetPerspectiveReturn {
  perspective?: CEView;
  status: AsyncStatus;
}

const useGetPerspective = ({
  backendBaseUrl,
  accountId,
  perspectiveId,
  envFromUrl,
}: useGetFeatureEnvArgs): UseGetPerspectiveReturn => {
  const [perspective, setPerspective] = useState<CEView>();
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
      `${await backendBaseUrl}/harness/${envFromUrl}/gateway/ccm/api/perspective?perspectiveId=${perspectiveId}`,
      {
        headers,
      },
    );

    if (resp.status === 200) {
      const data = await resp.json();
      setPerspective(data.data);
      setStatus(AsyncStatus.Success);
    } else if (resp.status === 401) {
      setStatus(AsyncStatus.Unauthorized);
    } else if (resp.status === 403) {
      setStatus(AsyncStatus.Forbidden);
    } else {
      setStatus(AsyncStatus.Error);
    }
  }, [accountId, perspectiveId, envFromUrl]);

  return {
    perspective,
    status,
  };
};

export default useGetPerspective;
