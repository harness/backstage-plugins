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

export type FetchperspectiveGridQueryVariables = Exact<{
  filters: InputMaybe<
    | Array<InputMaybe<QlceViewFilterWrapperInput>>
    | InputMaybe<QlceViewFilterWrapperInput>
  >;
  groupBy: InputMaybe<
    Array<InputMaybe<QlceViewGroupByInput>> | InputMaybe<QlceViewGroupByInput>
  >;
  limit: InputMaybe<Scalars['Int']>;
  offset: InputMaybe<Scalars['Int']>;
  aggregateFunction: InputMaybe<
    | Array<InputMaybe<QlceViewAggregationInput>>
    | InputMaybe<QlceViewAggregationInput>
  >;
  isClusterOnly: Scalars['Boolean'];
  isClusterHourlyData?: InputMaybe<Scalars['Boolean']>;
  preferences: InputMaybe<ViewPreferencesInput>;
}>;

export type FetchperspectiveGridQuery = {
  __typename?: 'Query';
  perspectiveTotalCount: number | null;
  perspectiveGrid: {
    __typename?: 'PerspectiveEntityStatsData';
    data: Array<{
      __typename?: 'QLCEViewEntityStatsDataPoint';
      name: string | null;
      id: string | null;
      cost: any | null;
      costTrend: any | null;
      clusterPerspective?: boolean;
      clusterData?: {
        __typename?: 'ClusterData';
        appId: string | null;
        appName: string | null;
        avgCpuUtilization: number | null;
        avgMemoryUtilization: number | null;
        cloudProvider: string | null;
        cloudProviderId: string | null;
        cloudServiceName: string | null;
        clusterId: string | null;
        clusterName: string | null;
        clusterType: string | null;
        costTrend: number | null;
        cpuBillingAmount: number | null;
        cpuActualIdleCost: number | null;
        cpuUnallocatedCost: number | null;
        efficiencyScore: number;
        efficiencyScoreTrendPercentage: number;
        envId: string | null;
        envName: string | null;
        environment: string | null;
        id: string | null;
        idleCost: number | null;
        launchType: string | null;
        maxCpuUtilization: number | null;
        maxMemoryUtilization: number | null;
        memoryBillingAmount: number | null;
        memoryActualIdleCost: number | null;
        memoryUnallocatedCost: number | null;
        name: string | null;
        namespace: string | null;
        networkCost: number | null;
        prevBillingAmount: number | null;
        region: string | null;
        serviceId: string | null;
        serviceName: string | null;
        storageCost: number | null;
        storageActualIdleCost: number | null;
        storageRequest: number | null;
        storageUnallocatedCost: number | null;
        storageUtilizationValue: number | null;
        totalCost: number | null;
        trendType: string | null;
        type: string | null;
        unallocatedCost: number | null;
        workloadName: string | null;
        workloadType: string | null;
      } | null;
      instanceDetails?: {
        __typename?: 'InstanceDetails';
        name: string | null;
        id: string | null;
        nodeId: string | null;
        clusterName: string | null;
        clusterId: string | null;
        nodePoolName: string | null;
        cloudProviderInstanceId: string | null;
        podCapacity: string | null;
        totalCost: number;
        idleCost: number;
        systemCost: number;
        unallocatedCost: number;
        cpuAllocatable: number;
        memoryAllocatable: number;
        instanceCategory: string | null;
        machineType: string | null;
        createTime: any;
        deleteTime: any;
        memoryBillingAmount: number;
        cpuBillingAmount: number;
        memoryUnallocatedCost: number;
        cpuUnallocatedCost: number;
        memoryIdleCost: number;
        cpuIdleCost: number;
      } | null;
      storageDetails?: {
        __typename?: 'StorageDetails';
        id: string | null;
        instanceId: string | null;
        instanceName: string | null;
        claimName: string | null;
        claimNamespace: string | null;
        clusterName: string | null;
        clusterId: string | null;
        storageClass: string | null;
        volumeType: string | null;
        cloudProvider: string | null;
        region: string | null;
        storageCost: number;
        storageActualIdleCost: number;
        storageUnallocatedCost: number;
        capacity: number;
        storageRequest: number;
        storageUtilizationValue: number;
        createTime: any;
        deleteTime: any;
      } | null;
    } | null> | null;
  } | null;
};

export type QlceViewEntityStatsDataPoint = {
  __typename?: 'QLCEViewEntityStatsDataPoint';
  clusterData: Maybe<ClusterData>;
  clusterPerspective: Scalars['Boolean'];
  cost: Maybe<Scalars['BigDecimal']>;
  costTrend: Maybe<Scalars['BigDecimal']>;
  id: Maybe<Scalars['String']>;
  instanceDetails: Maybe<InstanceDetails>;
  name: Maybe<Scalars['String']>;
  pricingSource: Maybe<Scalars['String']>;
  storageDetails: Maybe<StorageDetails>;
};

export type ClusterData = {
  __typename?: 'ClusterData';
  appId: Maybe<Scalars['String']>;
  appName: Maybe<Scalars['String']>;
  avgCpuUtilization: Maybe<Scalars['Float']>;
  avgMemoryUtilization: Maybe<Scalars['Float']>;
  cloudProvider: Maybe<Scalars['String']>;
  cloudProviderId: Maybe<Scalars['String']>;
  cloudServiceName: Maybe<Scalars['String']>;
  clusterId: Maybe<Scalars['String']>;
  clusterName: Maybe<Scalars['String']>;
  clusterType: Maybe<Scalars['String']>;
  costTrend: Maybe<Scalars['Float']>;
  cpuActualIdleCost: Maybe<Scalars['Float']>;
  cpuBillingAmount: Maybe<Scalars['Float']>;
  cpuIdleCost: Maybe<Scalars['Float']>;
  cpuUnallocatedCost: Maybe<Scalars['Float']>;
  efficiencyScore: Scalars['Int'];
  efficiencyScoreTrendPercentage: Scalars['Int'];
  envId: Maybe<Scalars['String']>;
  envName: Maybe<Scalars['String']>;
  environment: Maybe<Scalars['String']>;
  id: Maybe<Scalars['String']>;
  idleCost: Maybe<Scalars['Float']>;
  instanceId: Maybe<Scalars['String']>;
  instanceName: Maybe<Scalars['String']>;
  instanceType: Maybe<Scalars['String']>;
  launchType: Maybe<Scalars['String']>;
  maxCpuUtilization: Maybe<Scalars['Float']>;
  maxMemoryUtilization: Maybe<Scalars['Float']>;
  memoryActualIdleCost: Maybe<Scalars['Float']>;
  memoryBillingAmount: Maybe<Scalars['Float']>;
  memoryIdleCost: Maybe<Scalars['Float']>;
  memoryUnallocatedCost: Maybe<Scalars['Float']>;
  name: Maybe<Scalars['String']>;
  namespace: Maybe<Scalars['String']>;
  networkCost: Maybe<Scalars['Float']>;
  prevBillingAmount: Maybe<Scalars['Float']>;
  region: Maybe<Scalars['String']>;
  serviceId: Maybe<Scalars['String']>;
  serviceName: Maybe<Scalars['String']>;
  storageActualIdleCost: Maybe<Scalars['Float']>;
  storageCost: Maybe<Scalars['Float']>;
  storageRequest: Maybe<Scalars['Float']>;
  storageUnallocatedCost: Maybe<Scalars['Float']>;
  storageUtilizationValue: Maybe<Scalars['Float']>;
  systemCost: Maybe<Scalars['Float']>;
  taskId: Maybe<Scalars['String']>;
  totalCost: Maybe<Scalars['Float']>;
  trendType: Maybe<Scalars['String']>;
  type: Maybe<Scalars['String']>;
  unallocatedCost: Maybe<Scalars['Float']>;
  workloadName: Maybe<Scalars['String']>;
  workloadType: Maybe<Scalars['String']>;
};

export type InstanceDetails = {
  __typename?: 'InstanceDetails';
  cloudProviderInstanceId: Maybe<Scalars['String']>;
  clusterId: Maybe<Scalars['String']>;
  clusterName: Maybe<Scalars['String']>;
  cpuAllocatable: Scalars['Float'];
  cpuBillingAmount: Scalars['Float'];
  cpuIdleCost: Scalars['Float'];
  cpuRequested: Scalars['Float'];
  cpuUnallocatedCost: Scalars['Float'];
  cpuUnitPrice: Scalars['Float'];
  createTime: Scalars['Long'];
  deleteTime: Scalars['Long'];
  id: Maybe<Scalars['String']>;
  idleCost: Scalars['Float'];
  instanceCategory: Maybe<Scalars['String']>;
  machineType: Maybe<Scalars['String']>;
  memoryAllocatable: Scalars['Float'];
  memoryBillingAmount: Scalars['Float'];
  memoryIdleCost: Scalars['Float'];
  memoryRequested: Scalars['Float'];
  memoryUnallocatedCost: Scalars['Float'];
  memoryUnitPrice: Scalars['Float'];
  name: Maybe<Scalars['String']>;
  namespace: Maybe<Scalars['String']>;
  networkCost: Scalars['Float'];
  node: Maybe<Scalars['String']>;
  nodeId: Maybe<Scalars['String']>;
  nodePoolName: Maybe<Scalars['String']>;
  podCapacity: Maybe<Scalars['String']>;
  qosClass: Maybe<Scalars['String']>;
  storageActualIdleCost: Scalars['Float'];
  storageCost: Scalars['Float'];
  storageRequest: Scalars['Float'];
  storageUnallocatedCost: Scalars['Float'];
  storageUtilizationValue: Scalars['Float'];
  systemCost: Scalars['Float'];
  totalCost: Scalars['Float'];
  unallocatedCost: Scalars['Float'];
  workload: Maybe<Scalars['String']>;
};

export type StorageDetails = {
  __typename?: 'StorageDetails';
  capacity: Scalars['Float'];
  claimName: Maybe<Scalars['String']>;
  claimNamespace: Maybe<Scalars['String']>;
  cloudProvider: Maybe<Scalars['String']>;
  clusterId: Maybe<Scalars['String']>;
  clusterName: Maybe<Scalars['String']>;
  createTime: Scalars['Long'];
  deleteTime: Scalars['Long'];
  id: Maybe<Scalars['String']>;
  instanceId: Maybe<Scalars['String']>;
  instanceName: Maybe<Scalars['String']>;
  region: Maybe<Scalars['String']>;
  storageActualIdleCost: Scalars['Float'];
  storageClass: Maybe<Scalars['String']>;
  storageCost: Scalars['Float'];
  storageRequest: Scalars['Float'];
  storageUnallocatedCost: Scalars['Float'];
  storageUtilizationValue: Scalars['Float'];
  volumeType: Maybe<Scalars['String']>;
};

export type FetchPerspectiveTimeSeriesQueryVariables = Exact<{
  filters: InputMaybe<
    | Array<InputMaybe<QlceViewFilterWrapperInput>>
    | InputMaybe<QlceViewFilterWrapperInput>
  >;
  groupBy: InputMaybe<
    Array<InputMaybe<QlceViewGroupByInput>> | InputMaybe<QlceViewGroupByInput>
  >;
  limit: InputMaybe<Scalars['Int']>;
  preferences: InputMaybe<ViewPreferencesInput>;
  isClusterHourlyData?: InputMaybe<Scalars['Boolean']>;
}>;

export type FetchPerspectiveTimeSeriesQuery = {
  __typename?: 'Query';
  perspectiveTimeSeriesStats: {
    __typename?: 'PerspectiveTimeSeriesData';
    stats: Array<{
      __typename?: 'TimeSeriesDataPoints';
      time: any;
      values: Array<{
        __typename?: 'DataPoint';
        value: any;
        key: {
          __typename?: 'Reference';
          id: string;
          name: string;
          type: string;
        };
      } | null>;
    } | null> | null;
  } | null;
};

export type Reference = {
  __typename?: 'Reference';
  id: Scalars['String'];
  name: Scalars['String'];
  type: Scalars['String'];
};

export type DataPoint = {
  __typename?: 'DataPoint';
  key: Reference;
  value: Scalars['BigDecimal'];
};

export type TimeSeriesDataPoints = {
  __typename?: 'TimeSeriesDataPoints';
  time: Scalars['Long'];
  values: Array<Maybe<DataPoint>>;
};

export enum CloudProvider {
  Aws = 'AWS',
  Azure = 'AZURE',
  Gcp = 'GCP',
  Ibm = 'IBM',
  OnPrem = 'ON_PREM',
  Unknown = 'UNKNOWN',
}

export enum RecommendationState {
  Applied = 'APPLIED',
  Ignored = 'IGNORED',
  Open = 'OPEN',
}

export enum ResourceType {
  AzureInstance = 'AZURE_INSTANCE',
  Ec2Instance = 'EC2_INSTANCE',
  EcsService = 'ECS_SERVICE',
  Governance = 'GOVERNANCE',
  NodePool = 'NODE_POOL',
  Workload = 'WORKLOAD',
}

export type K8sRecommendationFilterDtoInput = {
  cloudProvider: InputMaybe<Array<InputMaybe<CloudProvider>>>;
  clusterNames: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  daysBack: InputMaybe<Scalars['Long']>;
  ids: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  limit: InputMaybe<Scalars['Long']>;
  minCost: InputMaybe<Scalars['Float']>;
  minSaving: InputMaybe<Scalars['Float']>;
  names: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  namespaces: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  offset: InputMaybe<Scalars['Long']>;
  perspectiveFilters: InputMaybe<Array<InputMaybe<QlceViewFilterWrapperInput>>>;
  recommendationStates: InputMaybe<Array<InputMaybe<RecommendationState>>>;
  resourceTypes: InputMaybe<Array<InputMaybe<ResourceType>>>;
};

export type PerspectiveRecommendationsQueryVariables = Exact<{
  filter: InputMaybe<K8sRecommendationFilterDtoInput>;
}>;

export type PerspectiveRecommendationsQuery = {
  __typename?: 'Query';
  recommendationStatsV2: {
    __typename?: 'RecommendationOverviewStats';
    totalMonthlyCost: number;
    totalMonthlySaving: number;
    count: number;
  } | null;
};
