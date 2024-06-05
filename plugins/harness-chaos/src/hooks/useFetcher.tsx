import { useState } from 'react';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import { getSecureHarnessKey } from '../utils/getHarnessToken';

export enum AsyncStatus {
  Init,
  Loading,
  Success,
  Error,
  Unauthorized,
}

interface UseFetcherProps {
  accountId: string;
  orgId: string;
  projectId: string;
  body?: string;
  method: 'GET' | 'POST';
  env: string;
  backendBaseUrl: Promise<string>;
}

interface UseFetcherReturn<T> {
  data: T | undefined;
  status: AsyncStatus;
  error: Error | undefined;
  loading: boolean;
  refetch: () => void;
}

function useFetcher<T>({
  accountId,
  orgId,
  projectId,
  body = '',
  method = 'POST',
  env,
  backendBaseUrl,
}: UseFetcherProps): UseFetcherReturn<T> {
  const [status, setStatus] = useState(AsyncStatus.Init);

  const {
    value: data,
    loading,
    error,
    retry: refetch,
  } = useAsyncRetry(async (): Promise<T | undefined> => {
    const query = new URLSearchParams({
      routingId: `${accountId}`,
    });

    const token = getSecureHarnessKey('token');
    const auth = token ? `${token}` : '';

    const headers = new Headers({
      'content-type': 'application/json',
      Authorization: auth,
    });

    setStatus(AsyncStatus.Loading);

    const response = await fetch(
      `${await backendBaseUrl}/harness/${env}/gateway/chaos/manager/api/query?${query}`,
      {
        headers,
        method,
        body,
      },
    );

    if (response.status === 200) {
      const responseData = await response.json();
      setStatus(AsyncStatus.Success);
      return responseData;
    } else if (response.status === 401) {
      setStatus(AsyncStatus.Unauthorized);
      return undefined;
    }
    setStatus(AsyncStatus.Error);
    return undefined;
  }, [accountId, orgId, projectId, body, method, env]);

  return { status, data, loading, error, refetch };
}

export default useFetcher;
