import React from 'react';
import { makeStyles } from '@material-ui/core';
import { EmptyState } from '@backstage/core-components';
import { discoveryApiRef, useApi } from '@backstage/core-plugin-api';
import useGetLicense from '../../hooks/useGetLicense';
import { ChaosExperimentV1Table } from './ChaosExperimentV1Table';
import { getIdentifiersFromUrl } from '../../utils/getIdentifiersFromUrl';
import { useProjectUrlFromEntity } from '../../hooks/useGetSlugsFromEntity';

const useStyles = makeStyles(theme => ({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: '2px',
    fontSize: '14px !important',
  },
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));

const ChaosExperimentsV1: React.FC = () => {
  const classes = useStyles();
  const discoveryApi = useApi(discoveryApiRef);

  const backendBaseUrl = discoveryApi.getBaseUrl('proxy');

  // get all projects from entity
  const harnessChaosUrl = useProjectUrlFromEntity();

  const { accountId, orgId, projectId, env, baseUrl } = getIdentifiersFromUrl(
    harnessChaosUrl || '',
  );

  const { licenses } = useGetLicense({
    backendBaseUrl,
    env,
    accountId,
  });

  if (licenses === 'NA') {
    return (
      <EmptyState
        title="Chaos Module License not subscribed"
        missing="info"
        description="You need to subscribe to Chaos Module to view this page."
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

export default ChaosExperimentsV1;
