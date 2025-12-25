import React, { useMemo } from 'react';
import { Table } from '@backstage/core-components';
import RetryIcon from '@material-ui/icons/Replay';
import { useGetWorkspaceTableColumns } from '../components/WorkspaceList/useGetWorkspaceTableColumns';
import { WorkspaceDataType } from './WorkspaceList';
import { Resource, Output, DataSource } from '../hooks/useGetResources';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { getWorkspaceTableConfig } from '../utils/getWorkspaceTableConfig';
import { AsyncStatus } from '../types';
import TableEmptyState from './TableEmptyState';

interface Props {
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  refresh: boolean;
  pageSize: number;
  currTableData: Resource[] | Output[] | DataSource[] | null;
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
  workspaceDataType: WorkspaceDataType;
  onRowClick?: (data: any) => void;
  status?: AsyncStatus;
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
  workspaceDataType,
  onRowClick,
  status,
}) => {
  const columnsData = useGetWorkspaceTableColumns();

  const { columns, title } = useMemo(
    () => getWorkspaceTableConfig(workspaceDataType, columnsData),
    [workspaceDataType, columnsData],
  );

  const hasData = currTableData && currTableData.length > 0;

  return (
    <Table
      options={{
        paging: true,
        filtering: false,
        emptyRowsWhenPaging: false,
        pageSize: pageSize,
        search: true,  
        pageSizeOptions: [ 10, 25, 50],
        rowStyle: { cursor: onRowClick ? 'pointer' : 'default' },
      }}
      key="id'"
      data={currTableData ?? []}
      columns={columns}
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
      onRowClick={onRowClick ? (_event, _rowData) => onRowClick(_rowData) : undefined}
      emptyContent={
        <TableEmptyState
          status={status}
          hasData={!!hasData}
          classes={classes}
        />
      }
      title={title}
      page={page}
      onPageChange={handleChangePage}
      totalCount={totalElements}
      onRowsPerPageChange={handleChangeRowsPerPage}
    />
  );
};

export default WorkspaceTable;