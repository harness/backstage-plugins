export const fetchPerspectiveRecommendationsQuery = `query PerspectiveRecommendations($filter: K8sRecommendationFilterDTOInput) {
  recommendationStatsV2(filter: $filter) {
    totalMonthlyCost
    totalMonthlySaving
    count
  }
}
`;
