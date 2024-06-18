export const runExperimentMutation = `mutation runChaosExperiment($identifiers: IdentifiersRequest!, $workflowID: String!) {
  runChaosExperiment(workflowID: $workflowID, identifiers: $identifiers) {
    notifyID
  }
}
`;
