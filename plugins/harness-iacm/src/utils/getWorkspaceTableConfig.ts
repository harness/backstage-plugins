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
    case WorkspaceDataType.Resource:
      return {
        columns: columns.resourceColumns,
        title: 'Workspace Resources',
      };
    case WorkspaceDataType.Output:
      return {
        columns: columns.outputsColumns,
        title: 'Workspace Outputs',
      };
    case WorkspaceDataType.DataSource:
      return {
        columns: columns.dataSourceColumns,
        title: 'Workspace Data Sources',
      };
    default:
      return { columns: [], title: '' };
  }
};

