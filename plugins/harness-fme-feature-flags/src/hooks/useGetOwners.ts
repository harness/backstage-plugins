import { useEffect, useState } from 'react';
import { HarnessUser, HarnessGroup, Owner } from '../types';
import { fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { useProjectSlugFromEntity } from '../components/FMEFeatureList/useProjectSlugEntity';

interface UseGetOwners {
  resolvedBackendBaseUrl: string;
  refresh: number;
}

interface GroupResponse {
  data: {
    content: HarnessGroup[];
  };
}

interface UserResponse {
  data: Owner[];
  nextMarker: string | null;
}

const useGetOwners = ({ resolvedBackendBaseUrl, refresh }: UseGetOwners) => {
  const [ownersMap, setOwnersMap] = useState<Record<string, Owner>>({});
  const [loading, setLoading] = useState(false);
  const fetchApi = useApi(fetchApiRef);
  const { isMigrated } = useProjectSlugFromEntity();

  useEffect(() => {
    const fetchOwners = async () => {
      if (!resolvedBackendBaseUrl) return;

      const baseUrl = resolvedBackendBaseUrl;
      const headers = new Headers({
        'Content-Type': 'application/json',
      });

      setLoading(true);
      const ownerList: Record<string, Owner> = {};

      if (isMigrated === 'true') {
        // Migrated path - Harness API
        let pageIndex = 0;
        let hasMore = true;

        // Fetch users
        while (hasMore) {
          try {
            const resp = await fetchApi.fetch(
              `${baseUrl}/harness/prod/ng/api/user/aggregate?pageIndex=${pageIndex}`,
              { headers, method: 'POST' },
            );

            if (resp.status === 200) {
              const data = await resp.json();
              data.data.content.forEach((d: { user: HarnessUser }) => {
                ownerList[d.user.uuid] = {
                  id: d.user.uuid,
                  name: d.user.name,
                  email: d.user.email,
                  type: 'user',
                };
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
                ownerList[d.identifier] = {
                  id: d.identifier,
                  name: d.name,
                  type: 'group',
                };
              });

              if (dataGroups.data.content.length < 50) {
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
      } else {
        // Non-migrated path - Split.io API
        const pause = (duration: number) =>
          new Promise(resolve => setTimeout(resolve, duration));

        let offset = 0;
        let hasMore = true;

        // Fetch groups
        while (hasMore) {
          try {
            const resp = await fetchApi.fetch(
              `${baseUrl}/harnessfme/internal/api/v2/groups?limit=50&offset=${offset}`,
              { headers },
            );

            if (resp.status === 200) {
              const data = await resp.json();
              data.objects.forEach((d: Owner) => {
                ownerList[d.id] = d;
              });

              if (data.objects.length < 50) {
                hasMore = false;
              } else {
                offset += 50;
              }
            } else if (resp.status === 429) {
              const orgResetSeconds = parseInt(
                resp.headers.get('x-ratelimit-reset-seconds-org') || '0',
                10,
              );
              const ipResetSeconds = parseInt(
                resp.headers.get('x-ratelimit-reset-seconds-ip') || '0',
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

        // Fetch users
        hasMore = true;
        let nextMarker = null;
        while (hasMore) {
          try {
            const respUsers = await fetchApi.fetch(
              `${baseUrl}/harnessfme/internal/api/v2/users?limit=200${
                nextMarker !== null ? `&nextMarker=${nextMarker}` : ''
              }`,
              { headers },
            );

            if (respUsers.status === 200) {
              const dataUsers: UserResponse = await respUsers.json();
              dataUsers.data.forEach((d: Owner) => {
                ownerList[d.id] = d;
              });

              if (
                dataUsers.data.length < 200 ||
                !dataUsers.nextMarker ||
                nextMarker === dataUsers.nextMarker
              ) {
                hasMore = false;
              } else {
                nextMarker = dataUsers.nextMarker;
              }
            } else if (respUsers.status === 429) {
              const orgResetSeconds = parseInt(
                respUsers.headers.get('x-ratelimit-reset-seconds-org') || '2',
                10,
              );
              const ipResetSeconds = parseInt(
                respUsers.headers.get('x-ratelimit-reset-seconds-ip') || '2',
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
      }

      setOwnersMap(ownerList);
      setLoading(false);
    };

    fetchOwners();
  }, [resolvedBackendBaseUrl, refresh, fetchApi, isMigrated]);

  return { ownersMap, loading };
};
export default useGetOwners;
