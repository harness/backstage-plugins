import { useEffect, useState } from 'react';
import { FlagSet } from '../types';

interface UseGetFlagSets {
  resolvedBackendBaseUrl: string;
  workspaceId: string;
  refresh: number;
}


const UseGetFlagSets = ({
  resolvedBackendBaseUrl,
  workspaceId,
  refresh,
}: UseGetFlagSets) => {
  const [flagSetsMap, setFlagSetsMap] = useState<Record<string, FlagSet>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFlagSets = async () => {
      if (!resolvedBackendBaseUrl) return;

      const baseUrl =  resolvedBackendBaseUrl;
      const headers = new Headers({
        'Content-Type': 'application/json',
      });

      setLoading(true);
      let hasMore = true;
      const flagsetsList: Record<string, FlagSet> = {};


      const pause = (duration: number) => new Promise(resolve => setTimeout(resolve, duration));
      let nextMarker = 'null'
      // Fetch groups
      while (hasMore ) {
        try {
          const resp = await fetch(
            `${baseUrl}/harnessfme/api/v3/flag-sets?workspace_id=${workspaceId}&limit=200${nextMarker !== 'null' ? '&after='+nextMarker : ''}`,
            { headers },
          );

          if (resp.status === 200) {
            const data = await resp.json();
            data.data.forEach((d: FlagSet) => {
              flagsetsList[d.id] = d;
            });

            if (data.data.length < 200) {
              hasMore = false;
            } else {
              nextMarker = data.nextMarker;
            }
          } else if (resp.status === 429) {
            const orgResetSeconds = parseInt(resp.headers.get('x-ratelimit-reset-seconds-org') || '2', 10);
            const ipResetSeconds = parseInt(resp.headers.get('x-ratelimit-reset-seconds-ip') || '2', 10);
            const resetSeconds = Math.max(orgResetSeconds, ipResetSeconds);
            await pause(resetSeconds * 1000);
          } else {
            hasMore = false;
          }
        } catch (error) {
          console.error('Error fetching flagsets:', error);
          hasMore = false;
        }
      }


      setFlagSetsMap(flagsetsList);
      setLoading(false);
    };

    fetchFlagSets();
  }, [ resolvedBackendBaseUrl, refresh]); // Include dependencies in useEffect

  return { flagSetsMap, loading };
};

export default UseGetFlagSets;