import { useEffect, useState } from 'react';
import { Feature } from '../types';
import { fetchApiRef, useApi } from '@backstage/core-plugin-api';

interface useGetFeatureStatusEnv {
  workspaceId: string;
  envId: { id: string; name: string };
  resolvedBackendBaseUrl: string;
  refresh: number;
}

const useGetFeatureState = ({
  workspaceId,
  envId,
  resolvedBackendBaseUrl,
  refresh,
}: useGetFeatureStatusEnv) => {
  const [totalElements, setTotalElements] = useState(50);
  const [currTableData, setCurrTableData] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchApi = useApi(fetchApiRef);
  useEffect(() => {
    const fetchFeatureState = async () => {
      if (!envId.id || !workspaceId || !resolvedBackendBaseUrl) return;

      const baseUrl = resolvedBackendBaseUrl;
      const pause = (duration: number) =>
        new Promise(resolve => setTimeout(resolve, duration));

      setLoading(true);
      let offset = 0;
      let hasMore = true;

      const featureList: Feature[] = [];

      const headers = new Headers({
        'Content-Type': 'application/json',
      });

      while (hasMore) {
        try {
          const resp = await fetchApi.fetch(
            `${baseUrl}/harnessfme/internal/api/v2/splits/ws/${workspaceId}/environments/${envId.id}?limit=50&offset=${offset}`,
            { headers },
          );

          if (resp.status === 200) {
            const data = await resp.json();
            setTotalElements(data.totalCount);

            const newFeatures = data.objects.map((feature: Feature) => ({
              id: feature.id,
              name: feature?.name,
              lastUpdateTime: feature?.lastUpdateTime,
              creationTime: feature?.creationTime,
              killed: feature?.killed,
              trafficType: feature?.trafficType.name,
              defaultTreatment: feature?.defaultTreatment,
              flagSets: feature?.flagSets,
              lastTrafficReceivedAt: feature?.lastTrafficReceivedAt,
            }));

            featureList.push(...newFeatures);
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
      }

      setCurrTableData(featureList);
      setLoading(false);
    };

    fetchFeatureState();
  }, [resolvedBackendBaseUrl, workspaceId, envId.id, refresh, fetchApi]);

  return { totalElements, currTableData, loading };
};

export default useGetFeatureState;
