export const listExperimentScoresQuery = `query listWorkflow($identifiers: IdentifiersRequest!, $request: ListWorkflowRequest!) {
  listWorkflow(identifiers: $identifiers, request: $request) {
    totalNoOfWorkflows
    workflows {
      recentWorkflowRunDetails {
        resiliencyScore
      }
    }
  }
}
`;
