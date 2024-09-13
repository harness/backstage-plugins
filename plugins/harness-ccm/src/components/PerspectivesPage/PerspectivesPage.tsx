import React, { useEffect, useState } from 'react';
import { EmptyState } from '@backstage/core-components';
import {
  Card,
  Grid,
  Link,
  makeStyles,
  Typography,
  Button,
} from '@material-ui/core';
import { discoveryApiRef, useApi } from '@backstage/core-plugin-api';

import LaunchIcon from '@mui/icons-material/Launch';

import { useResourceSlugFromEntity } from '../../hooks/useResourceSlugFromEntity';
import useFetchPerspectiveDetailsSummaryWithBudget from '../../api/useFetchPerspectiveDetailsSummaryWithBudget';
import useGetPerspective from '../../hooks/useGetPerspective';

import usePerspectiveUrlFromEntity from '../../hooks/usePerspectiveUrlEntity';
import {
  CE_DATE_FORMAT_INTERNAL,
  clusterInfoUtil,
  DATE_RANGE_SHORTCUTS,
  DEFAULT_GROUP_BY,
  DEFAULT_TIME_RANGE,
  getGMTEndDateTime,
  getGMTStartDateTime,
  getGroupByFilter,
  getTimeFilters,
  getTimeRangeFilter,
  getViewFilterForId,
  PERSPECTIVE_DETAILS_AGGREGATE,
  perspectiveDefaultTimeRangeMapper,
  TimeRangeFilterType,
} from '../../utils/PerpsectiveUtils';
import {
  AsyncStatus,
  K8sRecommendationFilterDtoInput,
  QlceViewEntityStatsDataPoint,
  QlceViewTimeGroupType,
  TimeSeriesDataPoints,
} from '../../api/types';
import useFetchPerspectiveGrid from '../../api/useFetchPerspectiveGrid';
import useFetchPerspectiveChart from '../../api/useFetchPerspectiveChart';
import useGetLicense from '../../hooks/useGetLicense';

import CostCard from '../CostCard';
import PerspectivesChart from '../PerspectivesChart/PerspectivesChart';
import PerspectivesGrid from '../PerspectivesGrid/PerspectivesGrid';
import TimeFilter from '../TimeFilter/TimeFilter';
import RecommendationsCard from '../RecommendationsCard';
import useFetchPerspectiveRecommendations from '../../api/useFetchPerspectiveRecommendations';

const useStyles = makeStyles({
  subHeader: {
    display: 'flex',
    flexDirection: 'row-reverse',
    marginBottom: 20,
  },
  chartAndGridCtn: {
    marginTop: 24,
  },
  linkCard: {
    padding: 20,
    height: 125,
    gap: 16,
  },
  linkCtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
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
    baseUrl,
  } = useResourceSlugFromEntity(perspectiveUrl);

  const { perspective: perspectiveData, status } = useGetPerspective({
    accountId,
    backendBaseUrl,
    perspectiveId,
    envFromUrl,
  });

  const isPerspectiveLoading = status === AsyncStatus.Loading;

  const { isClusterOnly, recommendationsEnabled } = clusterInfoUtil(
    perspectiveData?.dataSources,
  );

  const [timeRange, setTimeRange] =
    useState<TimeRangeFilterType>(DEFAULT_TIME_RANGE);

  useEffect(() => {
    if (perspectiveData?.viewTimeRange) {
      const viewTimeRangeType =
        perspectiveData.viewTimeRange?.viewTimeRangeType;

      const dateRange =
        (viewTimeRangeType &&
          perspectiveDefaultTimeRangeMapper[viewTimeRangeType]) ||
        DATE_RANGE_SHORTCUTS.LAST_30_DAYS;

      setTimeRange({
        to: dateRange[1].format(CE_DATE_FORMAT_INTERNAL),
        from: dateRange[0].format(CE_DATE_FORMAT_INTERNAL),
      });
    }
  }, [perspectiveData]);

  const groupBy =
    perspectiveData?.viewVisualization?.groupBy || DEFAULT_GROUP_BY;
  const aggregation =
    perspectiveData?.viewVisualization?.granularity ||
    QlceViewTimeGroupType.Day;

  const isPerspectiveReady = !isPerspectiveLoading && perspectiveData;

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
            getGMTStartDateTime(timeRange.from),
            getGMTEndDateTime(timeRange.to),
          ),
        ],
        groupBy: [getGroupByFilter(groupBy)],
        isClusterHourlyData: false,
        isClusterQuery: false,
        preferences: perspectiveData?.viewPreferences,
      },
      lazy: !isPerspectiveReady,
    });

  const [page, setPage] = useState(0);

  const handleChangePage = (currentPage: number) => {
    setPage(currentPage);
  };

  const { perspectiveRecommendations, loading: areRecommendationsLoading } =
    useFetchPerspectiveRecommendations({
      accountId,
      backendBaseUrl,
      env: envFromUrl,
      variables: {
        filter: {
          perspectiveFilters: [
            getViewFilterForId(perspectiveId),
            ...getTimeFilters(
              getGMTStartDateTime(timeRange.from),
              getGMTEndDateTime(timeRange.to),
            ),
          ],
          minSaving: 1,
          offset: 0,
          limit: 10,
        } as unknown as K8sRecommendationFilterDtoInput,
      },
      lazy: !isPerspectiveReady,
    });

  const { perspectiveChart, loading: isChartLoading } =
    useFetchPerspectiveChart({
      accountId,
      backendBaseUrl,
      env: envFromUrl,
      variables: {
        filters: [
          getViewFilterForId(perspectiveId),
          ...getTimeFilters(
            getGMTStartDateTime(timeRange.from),
            getGMTEndDateTime(timeRange.to),
          ),
        ],
        groupBy: [getTimeRangeFilter(aggregation), getGroupByFilter(groupBy)],
        isClusterHourlyData: false,
        limit: 12,
        preferences: perspectiveData?.viewPreferences,
      },
      lazy: !isPerspectiveReady,
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
          getGMTStartDateTime(timeRange.from),
          getGMTEndDateTime(timeRange.to),
        ),
      ],
      groupBy: [getGroupByFilter(groupBy)],
      isClusterHourlyData: false,
      isClusterOnly,
      preferences: perspectiveData?.viewPreferences,
      limit: 15,
      offset: page * 15,
    },
    lazy: !isPerspectiveReady,
  });

  const totalCostStats = perspectiveSummary?.perspectiveTrendStats?.cost;
  const forecastedCostStats = perspectiveSummary?.perspectiveForecastCost?.cost;

  const chartData = perspectiveChart?.perspectiveTimeSeriesStats
    ?.stats as TimeSeriesDataPoints[];
  const gridData = perspectiveGrid?.perspectiveGrid
    ?.data as QlceViewEntityStatsDataPoint[];

  const { licenses } = useGetLicense({
    backendBaseUrl,
    env: envFromUrl,
    accountId,
  });

  const getCcmGetStartedLink = () =>
    `${baseUrl}/ng/account/${accountId}/ce/home/trial`;

  if (licenses === 'NA') {
    return (
      <EmptyState
        title="Cloud Cost Management Module License not subscribed"
        missing="info"
        description="You need to have an active Cloud Cost Management Module License to view this page."
        action={
          <Button
            variant="contained"
            color="primary"
            target="_blank"
            href={getCcmGetStartedLink()}
          >
            Get Started
          </Button>
        }
      />
    );
  } else if (licenses === 'Unauthorized') {
    return (
      <EmptyState
        title="Harness Cloud Cost Management"
        missing="info"
        description="The x-api-key is either missing or incorrect in app-config.yaml under proxy settings."
      />
    );
  }

  if (status === AsyncStatus.Forbidden) {
    return (
      <EmptyState
        title="Harness Cloud Cost Management"
        missing="info"
        description="You don't have access to view this Perspective"
      />
    );
  }

  return (
    <div>
      <div className={classes.subHeader}>
        <TimeFilter
          isLoading={isPerspectiveLoading}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
        />
      </div>
      <Grid container spacing={3} direction="row">
        <Grid item>
          <CostCard
            isLoading={isSummaryLoading || isPerspectiveLoading}
            statsLabel={totalCostStats?.statsLabel || ''}
            statsValue={totalCostStats?.statsValue || ''}
            statsDescription={totalCostStats?.statsDescription || ''}
            statsTrend={totalCostStats?.statsTrend}
          />
        </Grid>
        <Grid item>
          <CostCard
            isLoading={isSummaryLoading || isPerspectiveLoading}
            statsLabel={forecastedCostStats?.statsLabel || ''}
            statsValue={forecastedCostStats?.statsValue || ''}
            statsDescription={forecastedCostStats?.statsDescription || ''}
          />
        </Grid>
        {recommendationsEnabled ? (
          <Grid item>
            <RecommendationsCard
              isLoading={areRecommendationsLoading}
              totalSavings={
                perspectiveRecommendations?.recommendationStatsV2
                  ?.totalMonthlySaving || 0
              }
              recommendationsCount={
                perspectiveRecommendations?.recommendationStatsV2?.count || 0
              }
            />
          </Grid>
        ) : null}
        <div style={{ flexGrow: 1 }} />
        <Grid item>
          <Card className={classes.linkCard}>
            <Typography variant="h6">Want to see a detailed view?</Typography>
            <Link
              href={perspectiveUrl}
              target="_blank"
              className={classes.linkCtn}
            >
              Go to {perspectiveData?.name} Perspective{' '}
              <LaunchIcon fontSize="small" />
            </Link>
          </Card>
        </Grid>
      </Grid>
      <Card className={classes.chartAndGridCtn}>
        <PerspectivesChart
          isLoading={isChartLoading || isPerspectiveLoading}
          viewVisualization={perspectiveData?.viewVisualization?.chartType}
          data={chartData || []}
        />
        <PerspectivesGrid
          isLoading={isGridLoading || isPerspectiveLoading}
          data={gridData || []}
          totalCount={perspectiveGrid?.perspectiveTotalCount || 0}
          page={page}
          handlePageChange={handleChangePage}
        />
      </Card>
    </div>
  );
};

export default PerspectivesPage;
