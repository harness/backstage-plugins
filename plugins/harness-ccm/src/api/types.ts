export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};

export enum AsyncStatus {
  Init,
  Loading,
  Success,
  Error,
  Unauthorized,
}

export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** Built-in java.math.BigDecimal */
  BigDecimal: any;
  /** Built-in scalar representing an instant in time */
  Date: any;
  /** Long type */
  Long: any;
  /** Built-in scalar for map-like structures */
  Map_String_ContainerRecommendationScalar: any;
  /** Built-in scalar for map-like structures */
  Map_String_Map_String_StringScalar: any;
  /** Built-in scalar for map-like structures */
  Map_String_ObjectScalar: any;
  /** Built-in scalar for map-like structures */
  Map_String_ResourceRequirementScalar: any;
  /** Built-in scalar for map-like structures */
  Map_String_ServiceNowFieldValueNGScalar: any;
  /** Built-in scalar for map-like structures */
  Map_String_StringScalar: any;
  /** Built-in scalar representing a date-time with a UTC offset */
  OffsetDateTime: any;
  /** Built-in scalar representing a time with a UTC offset */
  OffsetTime: any;
  /** Use SPQR's SchemaPrinter to remove this from SDL */
  UNREPRESENTABLE: any;
};

export type QlceViewFieldInputInput = {
  fieldId: Scalars['String'];
  fieldName: Scalars['String'];
  identifier: ViewFieldIdentifier;
  identifierName: InputMaybe<Scalars['String']>;
};

export enum ViewFieldIdentifier {
  Aws = 'AWS',
  Azure = 'AZURE',
  BusinessMapping = 'BUSINESS_MAPPING',
  Cluster = 'CLUSTER',
  Common = 'COMMON',
  Custom = 'CUSTOM',
  Gcp = 'GCP',
  Label = 'LABEL',
}

export enum QlceViewFilterOperator {
  Equals = 'EQUALS',
  In = 'IN',
  Like = 'LIKE',
  NotIn = 'NOT_IN',
  NotNull = 'NOT_NULL',
  Null = 'NULL',
  Search = 'SEARCH',
}

export enum QlceViewTimeGroupType {
  Day = 'DAY',
  Hour = 'HOUR',
  Month = 'MONTH',
  Quarter = 'QUARTER',
  Week = 'WEEK',
  Year = 'YEAR',
}

export type QlceViewTimeTruncGroupByInput = {
  resolution: QlceViewTimeGroupType;
};

export type QlceViewFilterInput = {
  field: QlceViewFieldInputInput;
  operator: QlceViewFilterOperator;
  values: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type QlceViewRuleInput = {
  conditions: InputMaybe<Array<InputMaybe<QlceViewFilterInput>>>;
};

export enum QlceViewTimeFilterOperator {
  After = 'AFTER',
  Before = 'BEFORE',
}

export type QlceViewTimeFilterInput = {
  field: QlceViewFieldInputInput;
  operator: QlceViewTimeFilterOperator;
  value: Scalars['BigDecimal'];
};

export type QlceViewFilterWrapperInput = {
  idFilter: InputMaybe<QlceViewFilterInput>;
  inExpressionFilter: InputMaybe<QlceInExpressionFilterInput>;
  ruleFilter: InputMaybe<QlceViewRuleInput>;
  timeFilter: InputMaybe<QlceViewTimeFilterInput>;
  viewMetadataFilter: InputMaybe<QlceViewMetadataFilterInput>;
};

export type QlceViewGroupByInput = {
  entityGroupBy: InputMaybe<QlceViewFieldInputInput>;
  timeTruncGroupBy: InputMaybe<QlceViewTimeTruncGroupByInput>;
};

export type QlceViewMetadataFilterInput = {
  isPreview: Scalars['Boolean'];
  viewId: Scalars['String'];
};

export enum QlceViewAggregateOperation {
  Avg = 'AVG',
  Max = 'MAX',
  Min = 'MIN',
  Sum = 'SUM',
}

export type QlceViewAggregationInput = {
  columnName: Scalars['String'];
  operationType: QlceViewAggregateOperation;
};

export enum AwsViewPreferenceCost {
  Amortised = 'AMORTISED',
  Blended = 'BLENDED',
  Effective = 'EFFECTIVE',
  NetAmortised = 'NET_AMORTISED',
  Unblended = 'UNBLENDED',
}

export type AwsViewPreferences = {
  __typename?: 'AWSViewPreferences';
  awsCost: Maybe<AwsViewPreferenceCost>;
  includeCredits: Maybe<Scalars['Boolean']>;
  includeDiscounts: Maybe<Scalars['Boolean']>;
  includeRefunds: Maybe<Scalars['Boolean']>;
  includeTaxes: Maybe<Scalars['Boolean']>;
};

export type AwsViewPreferencesInput = {
  awsCost: InputMaybe<AwsViewPreferenceCost>;
  includeCredits: InputMaybe<Scalars['Boolean']>;
  includeDiscounts: InputMaybe<Scalars['Boolean']>;
  includeRefunds: InputMaybe<Scalars['Boolean']>;
  includeTaxes: InputMaybe<Scalars['Boolean']>;
};

export enum AzureCostType {
  Actual = 'ACTUAL',
  Amortized = 'AMORTIZED',
}

export type AzureViewPreferences = {
  __typename?: 'AzureViewPreferences';
  costType: Maybe<AzureCostType>;
};

export type AzureViewPreferencesInput = {
  costType: InputMaybe<AzureCostType>;
};

export type GcpViewPreferences = {
  __typename?: 'GCPViewPreferences';
  includeDiscounts: Maybe<Scalars['Boolean']>;
  includeTaxes: Maybe<Scalars['Boolean']>;
};

export type GcpViewPreferencesInput = {
  includeDiscounts: InputMaybe<Scalars['Boolean']>;
  includeTaxes: InputMaybe<Scalars['Boolean']>;
};

export type ViewPreferencesInput = {
  awsPreferences: InputMaybe<AwsViewPreferencesInput>;
  azureViewPreferences: InputMaybe<AzureViewPreferencesInput>;
  gcpPreferences: InputMaybe<GcpViewPreferencesInput>;
  includeOthers: InputMaybe<Scalars['Boolean']>;
  includeUnallocatedCost: InputMaybe<Scalars['Boolean']>;
  showAnomalies: InputMaybe<Scalars['Boolean']>;
};

export type FetchPerspectiveDetailsSummaryWithBudgetQueryVariables = Exact<{
  filters: InputMaybe<
    | Array<InputMaybe<QlceViewFilterWrapperInput>>
    | InputMaybe<QlceViewFilterWrapperInput>
  >;
  aggregateFunction: InputMaybe<
    | Array<InputMaybe<QlceViewAggregationInput>>
    | InputMaybe<QlceViewAggregationInput>
  >;
  isClusterQuery: InputMaybe<Scalars['Boolean']>;
  isClusterHourlyData?: InputMaybe<Scalars['Boolean']>;
  groupBy: InputMaybe<
    Array<InputMaybe<QlceViewGroupByInput>> | InputMaybe<QlceViewGroupByInput>
  >;
  preferences: InputMaybe<ViewPreferencesInput>;
}>;

export type QlceInExpressionFilterInput = {
  fields: Array<InputMaybe<QlceViewFieldInputInput>>;
  nullValueField: InputMaybe<Scalars['String']>;
  values: Array<InputMaybe<Array<InputMaybe<Scalars['String']>>>>;
};

export type FetchPerspectiveDetailsSummaryWithBudgetQuery = {
  perspectiveTrendStats: {
    cost: {
      statsDescription: string;
      statsLabel: string;
      statsTrend: any | null;
      statsValue: string;
      value: any | null;
    } | null;
    idleCost: {
      statsLabel: string;
      statsValue: string;
      value: any | null;
    } | null;
    unallocatedCost: {
      statsLabel: string;
      statsValue: string;
      value: any | null;
    } | null;
    utilizedCost: {
      statsLabel: string;
      statsValue: string;
      value: any | null;
    } | null;
    efficiencyScoreStats: {
      statsLabel: string | null;
      statsTrend: any | null;
      statsValue: string | null;
    } | null;
  } | null;
  perspectiveForecastCost: {
    cost: {
      statsLabel: string;
      statsTrend: any | null;
      statsValue: string;
      statsDescription: string;
      value: any | null;
    } | null;
  } | null;
};

export interface EmbeddedUser {
  email?: string;
  externalUserId?: string;
  name?: string;
  uuid?: string;
}

export interface ViewCondition {
  type?: string;
}

export interface ViewRule {
  viewConditions?: ViewCondition[];
}

export interface ViewTimeRange {
  endTime?: number;
  startTime?: number;
  viewTimeRangeType?:
    | 'LAST_7'
    | 'LAST_30'
    | 'LAST_MONTH'
    | 'CURRENT_MONTH'
    | 'CUSTOM';
}

export interface ViewField {
  fieldId?: string;
  fieldName?: string;
  identifier?:
    | 'CLUSTER'
    | 'AWS'
    | 'GCP'
    | 'AZURE'
    | 'COMMON'
    | 'CUSTOM'
    | 'BUSINESS_MAPPING'
    | 'LABEL';
  identifierName?: string;
}

export interface ViewVisualization {
  chartType?: 'STACKED_TIME_SERIES' | 'STACKED_LINE_CHART';
  granularity?: 'DAY' | 'MONTH';
  groupBy?: ViewField;
}

export interface CEView {
  accountId?: string;
  createdAt?: number;
  createdBy?: EmbeddedUser;
  dataSources?: (
    | 'CLUSTER'
    | 'AWS'
    | 'GCP'
    | 'AZURE'
    | 'COMMON'
    | 'CUSTOM'
    | 'BUSINESS_MAPPING'
    | 'LABEL'
  )[];
  folderId?: string;
  lastUpdatedAt?: number;
  lastUpdatedBy?: EmbeddedUser;
  name?: string;
  totalCost?: number;
  uuid?: string;
  viewPreferences?: ViewPreferencesInput;
  viewRules?: ViewRule[];
  viewState?: 'DRAFT' | 'COMPLETED';
  viewTimeRange?: ViewTimeRange;
  viewType?: 'SAMPLE' | 'CUSTOMER' | 'DEFAULT';
  viewVersion?: string;
  viewVisualization?: ViewVisualization;
}
