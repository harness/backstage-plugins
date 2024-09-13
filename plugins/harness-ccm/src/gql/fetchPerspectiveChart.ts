export const fetchPerspectiveChartQuery = `query FetchPerspectiveTimeSeries(
  $filters: [QLCEViewFilterWrapperInput]
  $groupBy: [QLCEViewGroupByInput]
  $limit: Int
  $preferences: ViewPreferencesInput
  $isClusterHourlyData: Boolean = null
) {
  perspectiveTimeSeriesStats(
    filters: $filters
    groupBy: $groupBy
    limit: $limit
    preferences: $preferences
    isClusterHourlyData: $isClusterHourlyData
    aggregateFunction: [{ operationType: SUM, columnName: "cost" }]
    sortCriteria: [{ sortType: COST, sortOrder: DESCENDING }]
  ) {
    stats {
      values {
        key {
          id
          name
          type
        }
        value
      }
      time
    }
  }
}
`;
