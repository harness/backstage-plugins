import { Card, Grid, makeStyles } from '@material-ui/core';
import React from 'react';
import CostCard from '../CostCard';
import PerspectivesChart from '../PerspectivesChart/PerspectivesChart';
import PerspectivesGrid from '../PerspectivesGrid/PerspectivesGrid';
import { useResourceSlugFromEntity } from '../../hooks/useResourceSlugFromEntity';
import { discoveryApiRef, useApi } from '@backstage/core-plugin-api';
import useFetchPerspectiveDetailsSummaryWithBudget from '../../api/useFetchPerspectiveDetailsSummaryWithBudget';
import useGetPerspective from '../../hooks/useGetPerspective';

const useStyles = makeStyles({
  mainCtn: {
    padding: 20,
  },
  chartAndGridCtn: {
    marginTop: 24,
  },
});

const PerspectivesPage: React.FC = () => {
  const classes = useStyles();
  const discoveryApi = useApi(discoveryApiRef);
  const backendBaseUrl = discoveryApi.getBaseUrl('proxy');

  const {
    accountId,
    envFromUrl = '',
    perspectiveId,
  } = useResourceSlugFromEntity();

  const { perspective, status } = useGetPerspective({
    accountId,
    backendBaseUrl,
    perspectiveId,
    envFromUrl,
  });

  // const { perspectiveSummary} = useFetchPerspectiveDetailsSummaryWithBudget({
  //   accountId,
  //   backendBaseUrl,
  //   env: envFromUrl,
  //   variables: {
  //     aggregateFunction: [
  //       {
  //         operationType: 'SUM',
  //         columnName: 'cost',
  //       },
  //       {
  //         operationType: 'MAX',
  //         columnName: 'startTime',
  //       },
  //       {
  //         operationType: 'MIN',
  //         columnName: 'startTime',
  //       },
  //     ],
  //     filters: [
  //       {
  //         viewMetadataFilter: {
  //           viewId: 'lTVIzWE0TP2jOsdMuMZ3RA',
  //           isPreview: false,
  //         },
  //       },
  //       {
  //         timeFilter: {
  //           field: {
  //             fieldId: 'startTime',
  //             fieldName: 'startTime',
  //             identifier: 'COMMON',
  //           },
  //           operator: 'AFTER',
  //           value: 1723248000000,
  //         },
  //       },
  //       {
  //         timeFilter: {
  //           field: {
  //             fieldId: 'startTime',
  //             fieldName: 'startTime',
  //             identifier: 'COMMON',
  //           },
  //           operator: 'BEFORE',
  //           value: 1723852799000,
  //         },
  //       },
  //     ],
  //     groupBy: [
  //       {
  //         entityGroupBy: {
  //           fieldId: 'gcpProjectId',
  //           fieldName: 'Project',
  //           identifier: 'GCP',
  //           identifierName: 'GCP',
  //         },
  //       },
  //     ],
  //     isClusterHourlyData: false,
  //     isClusterQuery: false,
  //   },
  // });

  return (
    <div className={classes.mainCtn}>
      <Grid container spacing={3} direction="row">
        <Grid item>
          <CostCard
            statsLabel="Total Cost"
            statsValue="$152K"
            statsDescription="of Aug 10 - Aug 15"
          />
        </Grid>
        <Grid item>
          <CostCard
            statsLabel="Forecasted Cost"
            statsValue="$186K"
            statsDescription="of Aug 16 - Aug 22"
          />
        </Grid>
      </Grid>
      <Card className={classes.chartAndGridCtn}>
        <PerspectivesChart />
        <PerspectivesGrid />
      </Card>
    </div>
  );
};

export default PerspectivesPage;
