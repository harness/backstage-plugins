import { useState } from 'react';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import {
  identityApiRef,
  useApi
} from '@backstage/core-plugin-api';

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
  const identityApi = useApi(identityApiRef);

  useAsyncRetry(async () => {
    const { token } = await identityApi.getCredentials();
    const response = await fetch(
      `${await backendBaseUrl}/harness/${env}/gateway/ng/api/licenses/account?routingId=${accountId}&accountIdentifier=${accountId}`,
      {
        headers: new Headers({
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        })
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
