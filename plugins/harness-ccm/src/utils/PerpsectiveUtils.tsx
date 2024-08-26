import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';

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
dayjs.extend(quarterOfYear);

export const todayInUTC = () => dayjs.utc();

export const LAST_30_DAYS_RANGE = [
  todayInUTC()
    .subtract(30, 'days')
    .startOf('day')
    .format(CE_DATE_FORMAT_INTERNAL),
  todayInUTC().endOf('day').format(CE_DATE_FORMAT_INTERNAL),
];

export const DEFAULT_TIME_RANGE: TimeRangeFilterType = {
  to: LAST_30_DAYS_RANGE[1],
  from: LAST_30_DAYS_RANGE[0],
};

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
  recommendationsEnabled: boolean;
} = dataSources => {
  let isClusterOnly = false;
  let recommendationsEnabled = false;

  if (!dataSources?.length) {
    return { isClusterOnly, recommendationsEnabled };
  }

  if (
    dataSources.length === 1 &&
    dataSources[0] === ViewFieldIdentifier.Cluster
  ) {
    isClusterOnly = true;
  }

  if (!dataSources.includes(ViewFieldIdentifier.Gcp)) {
    recommendationsEnabled = true;
  }

  return { isClusterOnly, recommendationsEnabled };
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

export const DATE_RANGE_SHORTCUTS: Record<string, dayjs.Dayjs[]> = {
  LAST_7_DAYS: [
    todayInUTC().subtract(6, 'days').startOf('day'),
    todayInUTC().endOf('day'),
  ],
  LAST_30_DAYS: [
    todayInUTC().subtract(30, 'days').startOf('day'),
    todayInUTC().endOf('day'),
  ],
  CURRENT_MONTH: [
    todayInUTC().startOf('month').startOf('day'),
    todayInUTC().endOf('day'),
  ],
  THIS_MONTH: [
    todayInUTC().startOf('month').startOf('day'),
    todayInUTC().endOf('month').subtract(1, 'days'),
  ],
  THIS_YEAR: [todayInUTC().startOf('year'), todayInUTC().endOf('day')],
  LAST_MONTH: [
    todayInUTC().subtract(1, 'month').startOf('month'),
    todayInUTC().subtract(1, 'month').endOf('month'),
  ],
  LAST_YEAR: [
    todayInUTC().subtract(1, 'year').startOf('year'),
    todayInUTC().subtract(1, 'year').endOf('year'),
  ],
  LAST_3_MONTHS: [
    todayInUTC().subtract(3, 'months').startOf('month'),
    todayInUTC().subtract(1, 'month').endOf('month'),
  ],
  LAST_6_MONTHS: [
    todayInUTC().subtract(6, 'months').startOf('month'),
    todayInUTC().subtract(1, 'month').endOf('month'),
  ],
  LAST_12_MONTHS: [
    todayInUTC().subtract(12, 'months').startOf('month'),
    todayInUTC().subtract(1, 'month').endOf('month'),
  ],
  THIS_QUARTER: [todayInUTC().startOf('quarter'), todayInUTC().endOf('day')],
  LAST_QUARTER: [
    todayInUTC().subtract(1, 'quarter').startOf('quarter'),
    todayInUTC().subtract(1, 'quarter').endOf('quarter'),
  ],
};

export enum DATE_RANGE_SHORTCUTS_NAME {
  'LAST_7_DAYS' = 'LAST_7_DAYS',
  'LAST_30_DAYS' = 'LAST_30_DAYS',
  'CURRENT_MONTH' = 'CURRENT_MONTH',
  'THIS_YEAR' = 'THIS_YEAR',
  'LAST_MONTH' = 'LAST_MONTH',
  'LAST_YEAR' = 'LAST_YEAR',
  'LAST_3_MONTHS' = 'LAST_3_MONTHS',
  'LAST_6_MONTHS' = 'LAST_6_MONTHS',
  'LAST_12_MONTHS' = 'LAST_12_MONTHS',
  'THIS_QUARTER' = 'THIS_QUARTER',
  'LAST_QUARTER' = 'LAST_QUARTER',
  'CUSTOM' = 'CUSTOM',
}

export const DateLabelToDisplayTextMap: Record<string, string> = {
  [DATE_RANGE_SHORTCUTS_NAME.LAST_7_DAYS]: 'Last 7 Days',
  [DATE_RANGE_SHORTCUTS_NAME.CURRENT_MONTH]: 'This Month',
  [DATE_RANGE_SHORTCUTS_NAME.LAST_30_DAYS]: 'Last 30 Days',
  [DATE_RANGE_SHORTCUTS_NAME.THIS_QUARTER]: 'This Quarter',
  [DATE_RANGE_SHORTCUTS_NAME.THIS_YEAR]: 'This Year',
  [DATE_RANGE_SHORTCUTS_NAME.LAST_MONTH]: 'Last Month',
  [DATE_RANGE_SHORTCUTS_NAME.LAST_QUARTER]: 'Last Quarter',
  [DATE_RANGE_SHORTCUTS_NAME.LAST_YEAR]: 'Last Year',
  [DATE_RANGE_SHORTCUTS_NAME.LAST_3_MONTHS]: 'Last 3 Months',
  [DATE_RANGE_SHORTCUTS_NAME.LAST_6_MONTHS]: 'Last 6 Months',
  [DATE_RANGE_SHORTCUTS_NAME.LAST_12_MONTHS]: 'Last 12 Months',
};

const LAST_7_DAYS = {
  label: DATE_RANGE_SHORTCUTS_NAME.LAST_7_DAYS,
  dateRange: DATE_RANGE_SHORTCUTS.LAST_7_DAYS,
  dateFormat: ['MMM D', 'MMM D'],
};

const LAST_30_DAYS = {
  label: DATE_RANGE_SHORTCUTS_NAME.LAST_30_DAYS,
  dateRange: DATE_RANGE_SHORTCUTS.LAST_30_DAYS,
  dateFormat: ['MMM YYYY'],
};

const CURRENT_MONTH = {
  label: DATE_RANGE_SHORTCUTS_NAME.CURRENT_MONTH,
  dateRange: DATE_RANGE_SHORTCUTS.CURRENT_MONTH,
  dateFormat: ['MMM YYYY'],
};

const THIS_QUARTER = {
  label: DATE_RANGE_SHORTCUTS_NAME.THIS_QUARTER,
  dateRange: DATE_RANGE_SHORTCUTS.THIS_QUARTER,
  dateFormat: ['MMM', 'MMM YYYY'],
};

const THIS_YEAR = {
  label: DATE_RANGE_SHORTCUTS_NAME.THIS_YEAR,
  dateRange: DATE_RANGE_SHORTCUTS.THIS_YEAR,
  dateFormat: ['YYYY'],
};
const LAST_MONTH = {
  label: DATE_RANGE_SHORTCUTS_NAME.LAST_MONTH,
  dateRange: DATE_RANGE_SHORTCUTS.LAST_MONTH,
  dateFormat: ['MMM YYYY'],
};
const LAST_YEAR = {
  label: DATE_RANGE_SHORTCUTS_NAME.LAST_YEAR,
  dateRange: DATE_RANGE_SHORTCUTS.LAST_YEAR,
  dateFormat: ['YYYY'],
};
const LAST_QUARTER = {
  label: DATE_RANGE_SHORTCUTS_NAME.LAST_QUARTER,
  dateRange: DATE_RANGE_SHORTCUTS.LAST_QUARTER,
  dateFormat: ['MMM', 'MMM YYYY'],
};
const LAST_3_MONTHS = {
  label: DATE_RANGE_SHORTCUTS_NAME.LAST_3_MONTHS,
  dateRange: DATE_RANGE_SHORTCUTS.LAST_3_MONTHS,
  dateFormat: ['MMM YYYY', 'MMM YYYY'],
};
const LAST_6_MONTHS = {
  label: DATE_RANGE_SHORTCUTS_NAME.LAST_6_MONTHS,
  dateRange: DATE_RANGE_SHORTCUTS.LAST_6_MONTHS,
  dateFormat: ['MMM YYYY', 'MMM YYYY'],
};

const LAST_12_MONTHS = {
  label: DATE_RANGE_SHORTCUTS_NAME.LAST_12_MONTHS,
  dateRange: DATE_RANGE_SHORTCUTS.LAST_12_MONTHS,
  dateFormat: ['MMM YYYY', 'MMM YYYY'],
};

export const RECOMMENDED_DATES = [LAST_7_DAYS, CURRENT_MONTH];

export const RELATIVE_DATES = [LAST_7_DAYS, LAST_30_DAYS];

export const CALENDAR_MONTH_DATES = [
  CURRENT_MONTH,
  THIS_QUARTER,
  THIS_YEAR,
  LAST_MONTH,
  LAST_QUARTER,
  LAST_YEAR,
  LAST_3_MONTHS,
  LAST_6_MONTHS,
  LAST_12_MONTHS,
];

export interface TimeRangeFilterType {
  to: string;
  from: string;
}
