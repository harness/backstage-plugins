import { useEffect, useState } from 'react';
import { HarnessUser, HarnessGroup, Owner } from '../types';
import { fetchApiRef, useApi } from '@backstage/core-plugin-api';

interface UseGetOwners {
  resolvedBackendBaseUrl: string;
  refresh: number;
}



interface GroupResponse {
  data: {
    content: Owner[];
  };
}

const useGetOwners = ({ resolvedBackendBaseUrl, refresh }: UseGetOwners) => {
  const [ownersMap, setOwnersMap] = useState<Record<string, Owner>>({});
  const [loading, setLoading] = useState(false);
  const fetchApi = useApi(fetchApiRef);
  useEffect(() => {
    const fetchOwners = async () => {
      if (!resolvedBackendBaseUrl) return;

      const baseUrl = resolvedBackendBaseUrl;
      const headers = new Headers({
        'Content-Type': 'application/json',
      });

      setLoading(true);
      let pageIndex = 0;
      let hasMore = true;
      const ownerList: Record<string, Owner> = {};

      const pause = (duration: number) =>
        new Promise(resolve => setTimeout(resolve, duration));

      // Fetch groups
      while (hasMore) {
        try {
          const resp = await fetchApi.fetch(
            `${baseUrl}/harness/prod/ng/api/user/aggregate?pageIndex=${pageIndex}`,
            { headers, method: 'POST' },
          );

          if (resp.status === 200) {
            const data = await resp.json();
            data.data.content.forEach((d: {user: HarnessUser}) => {
              ownerList[d.user.uuid] = {id: d.user.uuid, name: d.user.name, email: d.user.email, type: 'user'};
            });

            if (data.data.content.length < 50) {
              hasMore = false;
            } else {
              pageIndex += 1;
            }
          
          } else {
            hasMore = false;
          }
        } catch (error) {
          hasMore = false;
        }
      }

      // Fetch groups
      hasMore = true;
      pageIndex = 0;
      while (hasMore) {
        try {
          const respGroups = await fetchApi.fetch(
            `${baseUrl}/harness/prod/ng/api/user-groups?pageIndex=${pageIndex}`,
            { headers },
          );

          if (respGroups.status === 200) {
            const dataGroups: GroupResponse = await respGroups.json();
            dataGroups.data.content.forEach((d: HarnessGroup) => {
              ownerList[d.identifier] = {id: d.identifier, name: d.name, type: 'group'};
            });

            if (
              dataGroups.data.content.length < 50
            ) {
              hasMore = false;
            } else {
              pageIndex += 1;
            }
          
          } else {
            hasMore = false;
          }
        } catch (error) {
          hasMore = false;
        }
      }

      setOwnersMap(ownerList);
      setLoading(false);
    };

    fetchOwners();
  }, [resolvedBackendBaseUrl, refresh, fetchApi]); // Include dependencies in useEffect

  return { ownersMap, loading };
};

export default useGetOwners;
