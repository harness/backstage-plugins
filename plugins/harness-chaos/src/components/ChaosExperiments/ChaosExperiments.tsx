import React from 'react';
import { EmptyState } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { discoveryApiRef, useApi } from '@backstage/core-plugin-api';

import { Button, makeStyles } from '@material-ui/core';

import useGetLicense from '../../hooks/useGetLicense';
import { isV2Compatible } from '../../utils/getCompatibleVersion';
import { getIdentifiersFromUrl } from '../../utils/getIdentifiersFromUrl';
import { useProjectUrlFromEntity } from '../../hooks/useGetSlugsFromEntity';
import { ChaosExperimentV2Table } from '../ChaosExperimentV2Table/ChaosExperimentV2Table';
import { ChaosExperimentV1Table } from '../ChaosExperimentV1Table/ChaosExperimentV1Table';

const useStyles = makeStyles({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: '2px',
    fontSize: '14px !important',
  },
  empty: {
    padding: '32px',
    display: 'flex',
    justifyContent: 'center',
  },
});

const ChaosExperiments: React.FC = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const discoveryApi = useApi(discoveryApiRef);
  const harnessChaosUrl = useProjectUrlFromEntity();
  const backendBaseUrl = discoveryApi.getBaseUrl('proxy');

  const { accountId, orgId, projectId, env, baseUrl } = getIdentifiersFromUrl(
    harnessChaosUrl || '',
  );

  const { licenses } = useGetLicense({
    backendBaseUrl,
    env,
    accountId,
  });

  const getChaosGetStartedLink = () =>
    `${baseUrl}/ng/account/${accountId}/chaos/home/trial`;

  if (licenses === 'NA') {
    return (
      <EmptyState
        title="Chaos Module License not subscribed"
        missing="info"
        description="You need to have an active Chaos Module License to view this page."
        action={
          <Button
            variant="contained"
            color="primary"
            target="_blank"
            href={getChaosGetStartedLink()}
          >
            Get Started
          </Button>
        }
      />
    );
  } else if (licenses === 'Unauthorized') {
    return (
      <EmptyState
        title="Harness Chaos Engineering"
        missing="info"
        description="The x-api-key is either missing or incorrect in app-config.yaml under proxy settings."
      />
    );
  }

  if (isV2Compatible(entity))
    return (
      <div className={classes.container}>
        <ChaosExperimentV2Table
          accountId={accountId}
          env={env}
          orgId={orgId}
          projectId={projectId}
          baseUrl={baseUrl}
        />
      </div>
    );

  return (
    <div className={classes.container}>
      <ChaosExperimentV1Table
        accountId={accountId}
        env={env}
        orgId={orgId}
        projectId={projectId}
        baseUrl={baseUrl}
      />
    </div>
  );
};

export default ChaosExperiments;
