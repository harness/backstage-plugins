import { useState } from 'react';
import { getSecureHarnessKey } from '../util/getHarnessToken';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import { useBackstageToken } from './useBackstageToken';

interface useGetLicenseWithAuthProps {
  env: string;
  accountId: string;
  backendBaseUrl: Promise<string>;
}
const useGetLicenseWithAuth = ({
  backendBaseUrl,
  env,
  accountId,
}: useGetLicenseWithAuthProps) => {
  const [licenses, setLicenses] = useState('cd');
  const token = useBackstageToken();

  useAsyncRetry(async () => {
    const headers = new Headers({
      Authorization: `Bearer ${token.value}`,
    });

    const response = await fetch(
      `${await backendBaseUrl}/harness/${env}/gateway/ng/api/licenses/account?routingId=${accountId}&accountIdentifier=${accountId}`,
      {
        headers,
      },
    );

    if (response.status === 200) {
      const data = await response.json();
      if (data?.data?.allModuleLicenses?.CD?.length === 0) {
        setLicenses('ci');
      }
    }
  }, [env, accountId]);

  return { licenses };
};

export default useGetLicenseWithAuth;
