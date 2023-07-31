import { identityApiRef, useApi } from "@backstage/core-plugin-api";
import { useCallback, useEffect } from "react";
import { useAsyncFn } from "react-use";

export const useBackstageToken = () => {
  const identityApi = useApi(identityApiRef);

  const getToken = useCallback(async () => {
    const { token } = await identityApi.getCredentials();
    return token
  }, [useApi, identityApiRef]);

  const [state, fetchToken] = useAsyncFn(async () => {
    return await getToken();
  }, [getToken])

  useEffect(() => {
    fetchToken()
  }, [fetchToken])

  return {
    loading: state.loading,
    error: state.error,
    value: state?.value,
    fetchToken,
  }
}

