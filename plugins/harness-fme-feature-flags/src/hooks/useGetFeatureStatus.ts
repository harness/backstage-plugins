import { useEffect, useState } from 'react';
import { FeatureStatus } from '../types';
import { fetchApiRef, useApi } from '@backstage/core-plugin-api';
interface useGetFeatureStatusEnv {
  workspaceId: string;
  envId: { id: string; name: string };
  resolvedBackendBaseUrl: string;
  refresh: number;
}

const useGetFeatureStatus = ({
  workspaceId,
  envId,
  resolvedBackendBaseUrl,
  refresh,
}: useGetFeatureStatusEnv) => {
  const [featureStatusMap, setFeatureStatusMap] = useState<
    Record<string, FeatureStatus>
  >({});
  const [loading, setLoading] = useState(false);
  const fetchApi = useApi(fetchApiRef);
  useEffect(() => {
    const fetchFeatureStatus = async () => {
      if (!envId || !workspaceId || !resolvedBackendBaseUrl) return;

      const baseUrl = resolvedBackendBaseUrl;
      const pause = (duration: number) =>
        new Promise(resolve => setTimeout(resolve, duration));

      setLoading(true);
      let offset = 0;
      let hasMore = true;
      let flagFetchCount = 0;
      const featureList: Record<string, FeatureStatus> = {};

      const headers = new Headers({
        'Content-Type': 'application/json',
      });

      while (hasMore && flagFetchCount < 15) {
        try {
          const resp = await fetchApi.fetch(
            `${baseUrl}/harnessfme/internal/api/v2/splits/ws/${workspaceId}?limit=50&offset=${offset}`,
            { headers },
          );

          if (resp.status === 200) {
            const data = await resp.json();
            data.objects.forEach((d: FeatureStatus) => {
              featureList[d.name] = d;
            });

            if (data.objects.length < 50) {
              hasMore = false;
            } else {
              offset += 50;
            }
          } else if (resp.status === 429) {
            const orgResetSeconds = parseInt(
              resp.headers.get('x-ratelimit-reset-seconds-org') || '2',
              10,
            );
            const ipResetSeconds = parseInt(
              resp.headers.get('x-ratelimit-reset-seconds-ip') || '2',
              10,
            );
            const resetSeconds = Math.max(orgResetSeconds, ipResetSeconds);
            await pause(resetSeconds * 1000);
          } else {
            hasMore = false;
          }
        } catch (error) {
          hasMore = false;
        }
        flagFetchCount += 1;
      }

      setFeatureStatusMap(featureList);
      setLoading(false);
    };

    fetchFeatureStatus();
  }, [resolvedBackendBaseUrl, workspaceId, envId, refresh]);

  return { featureStatusMap, loading };
};

export default useGetFeatureStatus;
