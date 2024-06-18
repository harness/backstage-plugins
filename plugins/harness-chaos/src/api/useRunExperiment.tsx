import { getSecureHarnessKey } from '../utils/getHarnessToken';
import { runExperimentMutation } from '../gql/runExperimentMutation';

interface useRunExperimentProps {
  accountId: string;
  orgId: string;
  projectId: string;
  experimentId: string;
  backendBaseUrl: Promise<string>;
  env: string;
}

const useRunExperiment = ({
  backendBaseUrl,
  env,
  ...props
}: useRunExperimentProps) => {
  const query = new URLSearchParams({
    routingId: `${props.accountId}`,
  });

  const method = 'POST';

  const body = JSON.stringify({
    query: runExperimentMutation,
    variables: {
      identifiers: {
        accountIdentifier: props.accountId,
        orgIdentifier: props.orgId,
        projectIdentifier: props.projectId,
      },
      workflowID: props.experimentId,
    },
  });

  const runExperiment = async () => {
    const token = getSecureHarnessKey('token');
    const auth = token ? `${token}` : '';

    const headers = new Headers({
      'content-type': 'application/json',
      Authorization: auth,
    });

    const response = await fetch(
      `${await backendBaseUrl}/harness/${env}/gateway/chaos/manager/api/query?${query}`,
      {
        headers,
        method,
        body,
      },
    );

    const responseData = await response.json();
    return [responseData, response.status];
  };

  return { runExperiment };
};

export default useRunExperiment;
