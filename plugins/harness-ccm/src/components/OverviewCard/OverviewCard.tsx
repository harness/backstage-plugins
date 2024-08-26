import React from 'react';
import {
  CircularProgress,
  Divider,
  makeStyles,
  Typography,
} from '@material-ui/core';
import { InfoCard, InfoCardVariants } from '@backstage/core-components';
import {
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';
import { discoveryApiRef, useApi } from '@backstage/core-plugin-api';

import { isHarnessCcmAvailable } from '../Router';
import usePerspectiveUrlFromEntity from '../../hooks/usePerspectiveUrlEntity';
import { useResourceSlugFromEntity } from '../../hooks/useResourceSlugFromEntity';
import useFetchPerspectiveDetailsSummaryWithBudget from '../../api/useFetchPerspectiveDetailsSummaryWithBudget';
import {
  DEFAULT_GROUP_BY,
  getGMTEndDateTime,
  getGMTStartDateTime,
  getGroupByFilter,
  getTimeFilters,
  getViewFilterForId,
  LAST_30_DAYS_RANGE,
  PERSPECTIVE_DETAILS_AGGREGATE,
} from '../../utils/PerpsectiveUtils';

const useStyles = makeStyles({
  mainCtn: {
    display: 'flex',
    gap: 20,
    minHeight: 120,
  },
  emptyState: {
    minHeight: 120,
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

  const perspectiveUrl = usePerspectiveUrlFromEntity();
  const {
    accountId,
    envFromUrl = '',
    perspectiveId,
  } = useResourceSlugFromEntity(perspectiveUrl);

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

  if (!isHarnessCcmAvailable(entity)) {
    return (
      <>
        <MissingAnnotationEmptyState annotation="harness.io/perspective-url" />
      </>
    );
  }

  if (isSummaryLoading) {
    return (
      <InfoCard
        title="Cloud Cost Management"
        variant={variant}
        cardClassName={classes.emptyState}
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
    >
      <div>
        <Typography variant="subtitle2">
          {totalCostStats?.statsLabel}
        </Typography>
        <Typography variant="h4">{totalCostStats?.statsValue}</Typography>
        <Typography variant="body2">
          {totalCostStats?.statsDescription}
        </Typography>
      </div>
      <Divider orientation="vertical" />
      <div>
        <Typography variant="subtitle2">
          {forecastedCostStats?.statsLabel}
        </Typography>
        <Typography variant="h4">{forecastedCostStats?.statsValue}</Typography>
        <Typography variant="body2">
          {forecastedCostStats?.statsDescription}
        </Typography>
      </div>
    </InfoCard>
  );
}

export default OverviewCard;
