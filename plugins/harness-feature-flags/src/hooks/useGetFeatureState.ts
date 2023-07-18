import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import { useState } from 'react';
import { Feature } from '../types';
import { getSecureHarnessKey } from '../utils/getHarnessToken';

interface useGetFeatureStatusEnv {
  accountId: string;
  orgId: string;
  projectId: string;
  envId: string;
  backendBaseUrl: Promise<string>;
  refresh: boolean;
  envFromUrl: string;
}

const useGetFeatureState = ({
  accountId,
  projectId,
  envId,
  orgId,
  backendBaseUrl,
  refresh,
  envFromUrl,
}: useGetFeatureStatusEnv) => {
  const [totalElements, setTotalElements] = useState(50);
  const [currTableData, setCurrTableData] = useState<Feature[]>([]);
  const [isCallDone, setIsCallDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useAsyncRetry(async () => {
    if (!envId) {
      return;
    }
    const query = new URLSearchParams({
      routingId: `${accountId}`,
      projectIdentifier: `${projectId}`,
      environmentIdentifier: `${envId}`,
      accountIdentifier: `${accountId}`,
      orgIdentifier: `${orgId}`,
    });

    const token = getSecureHarnessKey('token');

    const headers = new Headers({
      'content-type': 'application/json',
      Authorization: token ? `${token}` : '',
    });

    setLoading(true);

    const resp = await fetch(
      `${await backendBaseUrl}/harness/${envFromUrl}/gateway/cf/admin/features?${query}&metrics=true&flagCounts=true&name=&summary=true`,
      {
        headers,
      },
    );

    if (resp.status === 200) {
      const data = await resp.json();

      if (data.itemCount < data.featureCounts.totalFeatures) {
        setTotalElements(data.itemCount);
      }
      const getFeatureList = (): Feature[] => {
        return data.features.map((feature: Feature) => ({
          name: feature?.name,
          owner: feature?.owner?.[0],
          modifiedAt: feature?.modifiedAt,
          createdAt: feature?.createdAt,
          archived: feature?.archived,
          kind: feature?.kind,
          identifier: feature?.identifier,
          status: feature?.status?.status,
          state: feature?.envProperties?.state,
          pipelineConfigured: feature?.envProperties?.pipelineConfigured,
        }));
      };
      if (!isCallDone) {
        setIsCallDone(true);
      }
      setCurrTableData(getFeatureList());
    }
    setLoading(false);
  }, [accountId, projectId, envId, orgId, refresh, envFromUrl]);

  return { totalElements, currTableData, isCallDone, loading };
};

export default useGetFeatureState;
