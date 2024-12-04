import React from 'react';
import { CircularProgress } from '@material-ui/core';

import { Table } from '@backstage/core-components';
import RetryIcon from '@material-ui/icons/Replay';
import { useGetWorkspaceTableColumns } from '../components/WorkspaceList/useGetWorkspaceTableColumns';
import { WorkspaceDataType } from './WorkspaceList';
import { Resource, Output } from '../hooks/useGetResources';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';

interface Props {
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  refresh: boolean;
  pageSize: number;
  currTableData: Resource[] | Output[] | null;
  page: number;
  handleChangePage: (currentPage: number, currentPageSize: number) => void;
  totalElements?: number;
  handleChangeRowsPerPage: (currentPageSize: number) => void;
  classes: ClassNameMap<
    | 'label'
    | 'select'
    | 'container'
    | 'empty'
    | 'menuItem'
    | 'noAccess'
    | 'workspaceList'
    | 'workspaceItem'
  >;
  baseUrl?: string;
  workspaceDataType: WorkspaceDataType;
}
const WorkspaceTable: React.FC<Props> = ({
  setRefresh,
  refresh,
  pageSize,
  currTableData,
  page,
  handleChangePage,
  totalElements,
  handleChangeRowsPerPage,
  classes,
  baseUrl,
  workspaceDataType,
}) => {
  const { resourceColumns, outputsColumns } = useGetWorkspaceTableColumns({
    baseUrl: baseUrl || '',
  });
  return (
    <Table
      options={{
        paging: true,
        filtering: false,
        emptyRowsWhenPaging: false,
        pageSize: pageSize,
        pageSizeOptions: [5, 10, 25],
      }}
      key="id'"
      data={currTableData ?? []}
      columns={
        workspaceDataType === WorkspaceDataType.Resource
          ? resourceColumns
          : outputsColumns
      }
      actions={[
        {
          icon: () => <RetryIcon />,
          tooltip: 'Refresh Data',
          isFreeAction: true,
          onClick: () => {
            setRefresh(!refresh);
          },
        },
      ]}
      emptyContent={
        <div className={classes.empty}>
          <CircularProgress />
        </div>
      }
      title="Workspace Resources"
      page={page}
      onPageChange={handleChangePage}
      totalCount={totalElements}
      onRowsPerPageChange={handleChangeRowsPerPage}
    />
  );
};

export default WorkspaceTable;
