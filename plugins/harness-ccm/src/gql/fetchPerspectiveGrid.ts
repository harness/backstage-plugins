export const fetchPerspectiveGridQuery = `query FetchperspectiveGrid(
  $filters: [QLCEViewFilterWrapperInput]
  $groupBy: [QLCEViewGroupByInput]
  $limit: Int
  $offset: Int
  $aggregateFunction: [QLCEViewAggregationInput]
  $isClusterOnly: Boolean!
  $isClusterHourlyData: Boolean = null
  $preferences: ViewPreferencesInput
) {
  perspectiveGrid(
    aggregateFunction: $aggregateFunction
    filters: $filters
    groupBy: $groupBy
    limit: $limit
    offset: $offset
    preferences: $preferences
    isClusterHourlyData: $isClusterHourlyData
    sortCriteria: [{ sortType: COST, sortOrder: DESCENDING }]
  ) {
    data {
      name
      id
      cost
      costTrend
      clusterPerspective @include(if: $isClusterOnly)
      clusterData @include(if: $isClusterOnly) {
        appId
        appName
        avgCpuUtilization
        avgMemoryUtilization
        cloudProvider
        cloudProviderId
        cloudServiceName
        clusterId
        clusterName
        clusterType
        costTrend
        cpuBillingAmount
        cpuActualIdleCost
        cpuUnallocatedCost
        efficiencyScore
        efficiencyScoreTrendPercentage
        envId
        envName
        environment
        id
        idleCost
        launchType
        maxCpuUtilization
        maxMemoryUtilization
        memoryBillingAmount
        memoryActualIdleCost
        memoryUnallocatedCost
        name
        namespace
        networkCost
        prevBillingAmount
        region
        serviceId
        serviceName
        storageCost
        storageActualIdleCost
        storageRequest
        storageUnallocatedCost
        storageUtilizationValue
        totalCost
        trendType
        type
        unallocatedCost
        workloadName
        workloadType
      }
      instanceDetails @include(if: $isClusterOnly) {
        name
        id
        nodeId
        clusterName
        clusterId
        nodePoolName
        cloudProviderInstanceId
        podCapacity
        totalCost
        idleCost
        systemCost
        unallocatedCost
        cpuAllocatable
        memoryAllocatable
        instanceCategory
        machineType
        createTime
        deleteTime
        memoryBillingAmount
        cpuBillingAmount
        memoryUnallocatedCost
        cpuUnallocatedCost
        memoryIdleCost
        cpuIdleCost
      }
      storageDetails @include(if: $isClusterOnly) {
        id
        instanceId
        instanceName
        claimName
        claimNamespace
        clusterName
        clusterId
        storageClass
        volumeType
        cloudProvider
        region
        storageCost
        storageActualIdleCost
        storageUnallocatedCost
        capacity
        storageRequest
        storageUtilizationValue
        createTime
        deleteTime
      }
    }
  }
  perspectiveTotalCount(
    filters: $filters
    groupBy: $groupBy
    isClusterQuery: $isClusterOnly
    isClusterHourlyData: $isClusterHourlyData
  )
}
`;
