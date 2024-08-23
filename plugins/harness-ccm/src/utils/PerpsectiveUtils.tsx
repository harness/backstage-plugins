import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import {
  QlceViewAggregateOperation,
  QlceViewFieldInputInput,
  QlceViewFilterWrapperInput,
  QlceViewGroupByInput,
  QlceViewTimeFilterOperator,
  QlceViewTimeGroupType,
  ViewFieldIdentifier,
} from '../api/types';

export const getViewFilterForId: (
  viewId: string,
  isPreview?: boolean,
) => QlceViewFilterWrapperInput = (viewId: string, isPreview = false) => {
  return {
    viewMetadataFilter: { viewId: viewId, isPreview: isPreview },
  } as QlceViewFilterWrapperInput;
};

const startTimeLabel = 'startTime';

export const CE_DATE_FORMAT_INTERNAL = 'YYYY-MM-DD';
export const CE_DATE_FORMAT_INTERNAL_MOMENT = `${CE_DATE_FORMAT_INTERNAL}THH:mm:ssZ`;

dayjs.extend(utc);
export const todayInUTC = () => dayjs.utc();

export const LAST_30_DAYS_RANGE = [
  todayInUTC()
    .subtract(30, 'days')
    .startOf('day')
    .format(CE_DATE_FORMAT_INTERNAL),
  todayInUTC().endOf('day').format(CE_DATE_FORMAT_INTERNAL),
];

export const getGMTStartDateTime = (str: string) =>
  dayjs(`${str}T00:00:00Z`, CE_DATE_FORMAT_INTERNAL_MOMENT).valueOf();
export const getGMTEndDateTime = (str: string) =>
  dayjs(`${str}T23:59:59Z`, CE_DATE_FORMAT_INTERNAL_MOMENT).valueOf();

export const getTimeFilters: (
  from: number,
  to: number,
) => QlceViewFilterWrapperInput[] = (from, to) => {
  return [
    {
      timeFilter: {
        field: {
          fieldId: startTimeLabel,
          fieldName: startTimeLabel,
          identifier: ViewFieldIdentifier.Common,
        },
        operator: QlceViewTimeFilterOperator.After,
        value: from,
      },
    },
    {
      timeFilter: {
        field: {
          fieldId: startTimeLabel,
          fieldName: startTimeLabel,
          identifier: ViewFieldIdentifier.Common,
        },
        operator: QlceViewTimeFilterOperator.Before,
        value: to,
      },
    },
  ] as QlceViewFilterWrapperInput[];
};

export const PERSPECTIVE_DETAILS_AGGREGATE = [
  { operationType: QlceViewAggregateOperation.Sum, columnName: 'cost' },
  { operationType: QlceViewAggregateOperation.Max, columnName: 'startTime' },
  { operationType: QlceViewAggregateOperation.Min, columnName: 'startTime' },
];

export const DEFAULT_GROUP_BY = {
  fieldId: 'product',
  fieldName: 'Product',
  identifier: ViewFieldIdentifier.Common,
  identifierName: ViewFieldIdentifier.Common,
};

export const getGroupByFilter: (
  groupBy: QlceViewFieldInputInput,
) => QlceViewGroupByInput = groupBy => {
  return {
    entityGroupBy: groupBy,
  } as QlceViewGroupByInput;
};

export const clusterInfoUtil: (dataSources?: string[]) => {
  isClusterOnly: boolean;
} = dataSources => {
  let isClusterOnly = false;

  if (!dataSources?.length) {
    return { isClusterOnly };
  }

  if (
    dataSources.length === 1 &&
    dataSources[0] === ViewFieldIdentifier.Cluster
  ) {
    isClusterOnly = true;
  }

  return { isClusterOnly };
};

export const getTimeRangeFilter: (
  aggregation: QlceViewTimeGroupType,
) => QlceViewGroupByInput = aggregation => {
  return {
    timeTruncGroupBy: {
      resolution: aggregation,
    },
  } as QlceViewGroupByInput;
};
