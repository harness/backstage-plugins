import React from 'react';
import {
  CircularProgress,
  Divider,
  makeStyles,
  Typography,
} from '@material-ui/core';
import {
  InfoCard,
  InfoCardVariants,
  EmptyState,
} from '@backstage/core-components';
import {
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';
import {
  discoveryApiRef,
  useApi,
  useRouteRef,
} from '@backstage/core-plugin-api';

import { isHarnessCcmAvailable } from '../Router';
import usePerspectiveUrlFromEntity from '../../hooks/usePerspectiveUrlEntity';
import { useResourceSlugFromEntity } from '../../hooks/useResourceSlugFromEntity';
import useFetchPerspectiveDetailsSummaryWithBudget from '../../api/useFetchPerspectiveDetailsSummaryWithBudget';
import {
  CE_DATE_FORMAT_INTERNAL,
  DATE_RANGE_SHORTCUTS,
  DEFAULT_GROUP_BY,
  getGMTEndDateTime,
  getGMTStartDateTime,
  getGroupByFilter,
  getTimeFilters,
  getViewFilterForId,
  PERSPECTIVE_DETAILS_AGGREGATE,
  perspectiveDefaultTimeRangeMapper,
} from '../../utils/PerpsectiveUtils';
import { rootRouteRef } from '../../routes';
import useFetchPerspectiveRecommendations from '../../api/useFetchPerspectiveRecommendations';
import {
  AsyncStatus,
  K8sRecommendationFilterDtoInput,
} from '../../api/types';
import useGetPerspective from '../../hooks/useGetPerspective';

const useStyles = makeStyles({
  mainCtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    minHeight: 157,
  },
  dataCtn: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    height: '100%',
  },
  emptyState: {
    minHeight: 157,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export interface OverviewCardProps {
  variant?: InfoCardVariants;
}

function OverviewCard(props: OverviewCardProps) {
  const { variant } = props;

  const classes = useStyles();

  const { entity } = useEntity();
  const discoveryApi = useApi(discoveryApiRef);
  const backendBaseUrl = discoveryApi.getBaseUrl('proxy');
  const perspectivesPageRoute = useRouteRef(rootRouteRef);

  const perspectiveUrl = usePerspectiveUrlFromEntity();
  const {
    accountId,
    envFromUrl = '',
    perspectiveId,
  } = useResourceSlugFromEntity(perspectiveUrl);

  const { perspective: perspectiveData, status } = useGetPerspective({
    accountId,
    backendBaseUrl,
    perspectiveId,
    envFromUrl,
  });

  const groupBy =
    perspectiveData?.viewVisualization?.groupBy || DEFAULT_GROUP_BY;

  const viewTimeRangeType = perspectiveData?.viewTimeRange?.viewTimeRangeType;

  const dateRange =
    (viewTimeRangeType &&
      perspectiveDefaultTimeRangeMapper[viewTimeRangeType]) ||
    DATE_RANGE_SHORTCUTS.LAST_30_DAYS;

  const timeRange = {
    to: dateRange[1].format(CE_DATE_FORMAT_INTERNAL),
    from: dateRange[0].format(CE_DATE_FORMAT_INTERNAL),
  };

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
      },
    });

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
    });

  if (!isHarnessCcmAvailable(entity)) {
    return (
      <InfoCard
        title="Cloud Cost Management"
        variant={variant}
        cardClassName={classes.emptyState}
      >
        <MissingAnnotationEmptyState annotation="harness.io/perspective-url" />
      </InfoCard>
    );
  }

  if (status === AsyncStatus.Forbidden) {
    return (
      <InfoCard
        title="Cloud Cost Management"
        variant={variant}
        cardClassName={classes.emptyState}
      >
        <EmptyState
          title=""
          missing="info"
          description="You don't have access to view this Perspective"
        />
      </InfoCard>
    );
  }

  if (isSummaryLoading || areRecommendationsLoading) {
    return (
      <InfoCard
        title="Cloud Cost Management"
        variant={variant}
        cardClassName={classes.emptyState}
        deepLink={{
          title: 'View Perspective',
          link: `${rootRouteRef}`,
        }}
      >
        <CircularProgress />
      </InfoCard>
    );
  }

  const totalCostStats = perspectiveSummary?.perspectiveTrendStats?.cost;
  const forecastedCostStats = perspectiveSummary?.perspectiveForecastCost?.cost;

  return (
    <InfoCard
      title="Cloud Cost Management"
      variant={variant}
      cardClassName={classes.mainCtn}
      deepLink={{
        title: 'View Perspective',
        link: perspectivesPageRoute(),
      }}
    >
      <div className={classes.dataCtn}>
        <Typography variant="subtitle2">
          {totalCostStats?.statsLabel}
        </Typography>
        <Typography variant="h4">{totalCostStats?.statsValue}</Typography>
        <Typography variant="body2">
          {totalCostStats?.statsDescription}
        </Typography>
      </div>
      <Divider orientation="vertical" />
      <div className={classes.dataCtn}>
        <Typography variant="subtitle2">
          {forecastedCostStats?.statsLabel}
        </Typography>
        <Typography variant="h4">{forecastedCostStats?.statsValue}</Typography>
        <Typography variant="body2">
          {forecastedCostStats?.statsDescription}
        </Typography>
      </div>
      <Divider orientation="vertical" />
      <div className={classes.dataCtn}>
        <Typography variant="subtitle2">Recommendations</Typography>
        <Typography variant="caption">
          {perspectiveRecommendations?.recommendationStatsV2?.count}{' '}
          recommendation(s) saving upto
        </Typography>
        <Typography variant="h4">{`$${perspectiveRecommendations?.recommendationStatsV2?.totalMonthlySaving.toLocaleString()}`}</Typography>
        <Typography variant="body2">per month</Typography>
      </div>
    </InfoCard>
  );
}

export default OverviewCard;
