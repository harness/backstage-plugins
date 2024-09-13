import { useState } from 'react';
import { getSecureHarnessKey } from '../utils/getHarnessToken';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';

interface useGetLicenseWithAuthProps {
  env: string;
  accountId: string;
  backendBaseUrl: Promise<string>;
}
const useGetLicense = ({
  backendBaseUrl,
  env,
  accountId,
}: useGetLicenseWithAuthProps) => {
  const [licenses, setLicenses] = useState('SRM');

  useAsyncRetry(async () => {
    const token = getSecureHarnessKey('token');
    const value = token ? `${token}` : '';

    const headers = new Headers({
      Authorization: value,
    });

    const response = await fetch(
      `${await backendBaseUrl}/harness/${env}/gateway/ng/api/licenses/account?routingId=${accountId}&accountIdentifier=${accountId}`,
      {
        headers,
      },
    );

    if (response.status === 200) {
      const data = await response.json();
      if (data?.data?.allModuleLicenses?.CE?.length === 0) {
        setLicenses('NA');
      }
    } else if (response.status === 401) {
      setLicenses('Unauthorized');
    }
  }, [env, accountId]);

  return { licenses };
};

export default useGetLicense;
