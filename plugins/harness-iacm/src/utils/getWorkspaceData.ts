import { WorkspaceDataType } from '../components/WorkspaceList';
import { Resource, Output, DataSource } from '../hooks/useGetResources';

export interface WorkspaceData {
  resources?: Resource[] | null;
  outputs?: Output[] | null;
  dataSources?: DataSource[] | null;
}

export const getCurrTableData = (
  workspaceDataType: WorkspaceDataType,
  data: WorkspaceData,
): Resource[] | Output[] | DataSource[] => {
  switch (workspaceDataType) {
    case WorkspaceDataType.ResourceType:
      return data.resources || [];
    case WorkspaceDataType.DataSourceType:
      return data.dataSources || [];
    case WorkspaceDataType.OutputType:
      return data.outputs || [];
    default:
      return [];
  }
};

export const getTotalElements = (
  workspaceDataType: WorkspaceDataType,
  data: WorkspaceData,
): number => {
  switch (workspaceDataType) {
    case WorkspaceDataType.ResourceType:
      return data.resources?.length || 0;
    case WorkspaceDataType.DataSourceType:
      return data.dataSources?.length || 0;
    case WorkspaceDataType.OutputType:
      return data.outputs?.length || 0;
    default:
      return 0;
  }
};

