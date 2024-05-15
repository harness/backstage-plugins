import React from 'react';
import { makeStyles } from '@material-ui/core';
import { getIdentifiersFromUrl } from '../../utils/getIdentifiersFromUrl';
import { ChaosExperimentV1Table } from './ChaosExperimentV1Table';
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

  // get all projects from entity
  const harnessChaosUrl = useProjectUrlFromEntity();

  const { accountId, orgId, projectId, env, baseUrl } = getIdentifiersFromUrl(
    harnessChaosUrl || '',
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

export default ChaosExperimentsV1;
