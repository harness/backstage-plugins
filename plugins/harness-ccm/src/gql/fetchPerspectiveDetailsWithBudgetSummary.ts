export const fetchPerspectiveDetailsWithBudgetSummaryQuery = `
  query FetchPerspectiveDetailsSummaryWithBudget(
    $filters: [QLCEViewFilterWrapperInput]
    $aggregateFunction: [QLCEViewAggregationInput]
    $isClusterQuery: Boolean
    $isClusterHourlyData: Boolean = null
    $groupBy: [QLCEViewGroupByInput]
    $preferences: ViewPreferencesInput
  ) {
    perspectiveTrendStats(
      filters: $filters
      aggregateFunction: $aggregateFunction
      isClusterQuery: $isClusterQuery
      isClusterHourlyData: $isClusterHourlyData
      groupBy: $groupBy
      preferences: $preferences
    ) {
      cost {
        statsDescription
        statsLabel
        statsTrend
        statsValue
        value
      }
      idleCost {
        statsLabel
        statsValue
        value
      }
      unallocatedCost {
        statsLabel
        statsValue
        value
      }
      utilizedCost {
        statsLabel
        statsValue
        value
      }
      efficiencyScoreStats {
        statsLabel
        statsTrend
        statsValue
      }
    }
    perspectiveForecastCost(
      filters: $filters
      aggregateFunction: $aggregateFunction
      isClusterQuery: $isClusterQuery
      isClusterHourlyData: $isClusterHourlyData
      groupBy: $groupBy
      preferences: $preferences
    ) {
      cost {
        statsLabel
        statsTrend
        statsValue
        statsDescription
        value
      }
    }
  }
`;
