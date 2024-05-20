export const listExperimentsQuery = `query listWorkflow($identifiers: IdentifiersRequest!, $request: ListWorkflowRequest!) {
  listWorkflow(identifiers: $identifiers, request: $request) {
    totalNoOfWorkflows
    workflows {
      workflowID
      cronSyntax
      isCronEnabled
      infra {
        infraID
        infraType
        name
        environmentID
        isActive
        isInfraConfirmed
      }
      workflowType
      workflowManifest
      lastExecutedAt
      name
      description
      tags
      createdAt
      createdBy {
        username
      }
      updatedAt
      updatedBy {
        username
      }
      recentWorkflowRunDetails {
        workflowRunID
        notifyID
        phase
        resiliencyScore
        createdAt
        createdBy {
          username
        }
      }
      eventsMetadata {
        faultName
        serviceIdentifier
        environmentIdentifier
      }
    }
  }
}
`;
