import { TableColumn } from '@backstage/core-components';
import { WorkspaceDataType } from '../components/WorkspaceList';

export interface WorkspaceTableConfig {
  columns: TableColumn[];
  title: string;
}

export interface WorkspaceColumns {
  resourceColumns: TableColumn[];
  outputsColumns: TableColumn[];
  dataSourceColumns: TableColumn[];
}

export const getWorkspaceTableConfig = (
  workspaceDataType: WorkspaceDataType,
  columns: WorkspaceColumns,
): WorkspaceTableConfig => {
  switch (workspaceDataType) {
    case WorkspaceDataType.ResourceType:
      return {
        columns: columns.resourceColumns,
        title: 'Workspace Resources',
      };
    case WorkspaceDataType.OutputType:
      return {
        columns: columns.outputsColumns,
        title: 'Workspace Outputs',
      };
    case WorkspaceDataType.DataSourceType:
      return {
        columns: columns.dataSourceColumns,
        title: 'Workspace Data Sources',
      };
    default:
      return { columns: [], title: '' };
  }
};
