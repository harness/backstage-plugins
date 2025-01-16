import { useEffect, useState } from 'react';
import { AsyncStatus } from '../types';

interface useGetFeatureEnvArgs {
  resolvedBackendBaseUrl: string;
  workspaceId: string;
  refresh: number;
}

const useGetFeatureEnv = ({
  resolvedBackendBaseUrl,
  workspaceId,
  refresh,
}: useGetFeatureEnvArgs) => {
  const [ffEnvIds, setffEnvIds] = useState<{ id: string; name: string }[]>([]);
  const [status, setStatus] = useState<AsyncStatus>(AsyncStatus.Init);

  useEffect(() => {
    const fetchEnvironments = async () => {
      if (!workspaceId || !resolvedBackendBaseUrl) return;

      setStatus(AsyncStatus.Loading);
      try {
        const headers = new Headers({
          'Content-Type': 'application/json',
        });

        const resp = await fetch(
          `${resolvedBackendBaseUrl}/harnessfme/internal/api/v2/environments/ws/${workspaceId}`,
          { headers },
        );

        if (resp.status === 200) {
          const data = await resp.json();
          setffEnvIds(
            data?.map((obj: any) => ({ id: obj.id, name: obj.name })),
          );
          setStatus(AsyncStatus.Success);
        } else if (resp.status === 401) {
          setStatus(AsyncStatus.Unauthorized);
        } else {
          setStatus(AsyncStatus.Error);
        }
      } catch (error) {
        setStatus(AsyncStatus.Error);
      }
    };

    fetchEnvironments();
  }, [resolvedBackendBaseUrl, workspaceId, refresh]); // Now using resolvedBaseUrl instead of the Promise

  return { ffEnvIds, status };
};

export default useGetFeatureEnv;
