import { Card, Grid, makeStyles } from '@material-ui/core';
import React, { useState } from 'react';
import CostCard from '../CostCard';
import PerspectivesChart from '../PerspectivesChart/PerspectivesChart';
import PerspectivesGrid from '../PerspectivesGrid/PerspectivesGrid';
import { useResourceSlugFromEntity } from '../../hooks/useResourceSlugFromEntity';
import { discoveryApiRef, useApi } from '@backstage/core-plugin-api';
import useFetchPerspectiveDetailsSummaryWithBudget from '../../api/useFetchPerspectiveDetailsSummaryWithBudget';
import useGetPerspective from '../../hooks/useGetPerspective';

import usePerspectiveUrlFromEntity from '../../hooks/usePerspectiveUrlEntity';
import {
  clusterInfoUtil,
  DEFAULT_GROUP_BY,
  getGMTEndDateTime,
  getGMTStartDateTime,
  getGroupByFilter,
  getTimeFilters,
  getTimeRangeFilter,
  getViewFilterForId,
  LAST_30_DAYS_RANGE,
  PERSPECTIVE_DETAILS_AGGREGATE,
} from '../../utils/PerpsectiveUtils';
import {
  QlceViewEntityStatsDataPoint,
  QlceViewTimeGroupType,
  TimeSeriesDataPoints,
} from '../../api/types';
import useFetchPerspectiveGrid from '../../api/useFetchPerspectiveGrid';
import useFetchPerspectiveChart from '../../api/useFetchPerspectiveChart';

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

  const perspectiveUrl = usePerspectiveUrlFromEntity();
  const {
    accountId,
    envFromUrl = '',
    perspectiveId,
  } = useResourceSlugFromEntity(perspectiveUrl);

  const { perspective: perspectiveData } = useGetPerspective({
    accountId,
    backendBaseUrl,
    perspectiveId,
    envFromUrl,
  });

  const { isClusterOnly } = clusterInfoUtil(perspectiveData?.dataSources);

  const { perspectiveSummary, loading: isSummaryLoading } =
    useFetchPerspectiveDetailsSummaryWithBudget({
      accountId,
      backendBaseUrl,
      env: envFromUrl,
      variables: {
        aggregateFunction: PERSPECTIVE_DETAILS_AGGREGATE,
        filters: [
          getViewFilterForId(perspectiveId),
          ...getTimeFilters(
            getGMTStartDateTime(LAST_30_DAYS_RANGE[0]),
            getGMTEndDateTime(LAST_30_DAYS_RANGE[1]),
          ),
        ],
        groupBy: [getGroupByFilter(DEFAULT_GROUP_BY)],
        isClusterHourlyData: false,
        isClusterQuery: false,
      },
    });

  const [page, setPage] = useState(0);

  const handleChangePage = (currentPage: number) => {
    setPage(currentPage);
  };

  const { perspectiveChart, loading: isChartLoading } =
    useFetchPerspectiveChart({
      accountId,
      backendBaseUrl,
      env: envFromUrl,
      variables: {
        filters: [
          getViewFilterForId(perspectiveId),
          ...getTimeFilters(
            getGMTStartDateTime(LAST_30_DAYS_RANGE[0]),
            getGMTEndDateTime(LAST_30_DAYS_RANGE[1]),
          ),
        ],
        groupBy: [
          getTimeRangeFilter(QlceViewTimeGroupType.Day),
          getGroupByFilter(DEFAULT_GROUP_BY),
        ],
        isClusterHourlyData: false,
        limit: 12,
      },
    });

  const { perspectiveGrid, loading: isGridLoading } = useFetchPerspectiveGrid({
    accountId,
    backendBaseUrl,
    env: envFromUrl,
    variables: {
      aggregateFunction: PERSPECTIVE_DETAILS_AGGREGATE,
      filters: [
        getViewFilterForId(perspectiveId),
        ...getTimeFilters(
          getGMTStartDateTime(LAST_30_DAYS_RANGE[0]),
          getGMTEndDateTime(LAST_30_DAYS_RANGE[1]),
        ),
      ],
      groupBy: [getGroupByFilter(DEFAULT_GROUP_BY)],
      isClusterHourlyData: false,
      isClusterOnly,
      limit: 15,
      offset: page * 15,
    },
  });

  return (
    <div className={classes.mainCtn}>
      <Grid container spacing={3} direction="row">
        <Grid item>
          <CostCard
            isLoading={isSummaryLoading}
            statsLabel={
              perspectiveSummary?.perspectiveTrendStats?.cost?.statsLabel || ''
            }
            statsValue={
              perspectiveSummary?.perspectiveTrendStats?.cost?.statsValue || ''
            }
            statsDescription={
              perspectiveSummary?.perspectiveTrendStats?.cost
                ?.statsDescription || ''
            }
          />
        </Grid>
        <Grid item>
          <CostCard
            isLoading={isSummaryLoading}
            statsLabel={
              perspectiveSummary?.perspectiveForecastCost?.cost?.statsLabel ||
              ''
            }
            statsValue={
              perspectiveSummary?.perspectiveForecastCost?.cost?.statsValue ||
              ''
            }
            statsDescription={
              perspectiveSummary?.perspectiveForecastCost?.cost
                ?.statsDescription || ''
            }
          />
        </Grid>
      </Grid>
      <Card className={classes.chartAndGridCtn}>
        <PerspectivesChart
          isLoading={isChartLoading}
          data={
            (perspectiveChart?.perspectiveTimeSeriesStats
              ?.stats as TimeSeriesDataPoints[]) || []
          }
        />
        <PerspectivesGrid
          isLoading={isGridLoading}
          data={
            (perspectiveGrid?.perspectiveGrid
              ?.data as QlceViewEntityStatsDataPoint[]) || []
          }
          totalCount={perspectiveGrid?.perspectiveTotalCount || 0}
          page={page}
          handlePageChange={handleChangePage}
        />
      </Card>
    </div>
  );
};

export default PerspectivesPage;
