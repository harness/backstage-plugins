import React, { useMemo } from 'react';
import { CircularProgress } from '@material-ui/core';

import { Table } from '@backstage/core-components';
import RetryIcon from '@material-ui/icons/Replay';
import { useGetWorkspaceTableColumns } from '../components/WorkspaceList/useGetWorkspaceTableColumns';
import { WorkspaceDataType } from './WorkspaceList';
import { Resource, Output, DataSource } from '../hooks/useGetResources';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { getWorkspaceTableConfig } from '../utils/getWorkspaceTableConfig';

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
  const columnsData = useGetWorkspaceTableColumns({
    baseUrl: baseUrl || '',
  });

  const { columns, title } = useMemo(
    () => getWorkspaceTableConfig(workspaceDataType, columnsData),
    [workspaceDataType, columnsData],
  );

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
      emptyContent={
        <div className={classes.empty}>
          <CircularProgress />
        </div>
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