import React from 'react';
import { CircularProgress, Link, Typography } from '@material-ui/core';

import { Table, TableColumn } from '@backstage/core-components';
import RetryIcon from '@material-ui/icons/Replay';
import { TableData } from '../types';

import Aws from '../icons/aws';
import Azure from '../icons/azure';
import Gcp from '../icons/gcp';
import Kubernetes from '../icons/kubernetes';

export const getProviderIcon = (name?: string): React.ReactNode => {
  if (!name) return <Aws />;
  if (name.includes('aws')) {
    return <Aws />;
  }

  if (name.includes('azure')) {
    return <Azure />;
  }
  if (name.includes('gcp') || name.includes('google')) {
    return <Gcp />;
  }
  if (name.includes('kubernetes') || name.includes('k8s')) {
    return <Kubernetes />;
  }
  return null;
};

const ResourceTable: React.FC<any> = ({
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
}) => {
  const columns: TableColumn[] = [
    {
      title: 'Provider',
      field: 'col1',
      width: '22%',
      render: (row: Partial<TableData>) => {
        return (
          <Link
            href={baseUrl}
            target="_blank"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <b>{row.provider}</b>
          </Link>
        );
      },
      customFilterAndSearch: (term, row: Partial<TableData>) => {
        const temp = row?.provider ?? '';
        return temp.toLowerCase().indexOf(term.toLowerCase()) > -1;
      },
      customSort: (row1: Partial<TableData>, row2: Partial<TableData>) => {
        const a = row1.provider ?? '';
        const b = row2.provider ?? '';
        return a > b ? 1 : -1;
      },
    },
    {
      title: 'Type',
      field: 'col2',
      width: '18%',
      render: (row: Partial<TableData>) => (
        <span style={{ display: 'flex', gap: '5px' }}>
          {getProviderIcon(row.provider)}
          <Typography style={{ fontSize: 'small', color: 'grey' }}>
            {row.type}
          </Typography>
        </span>
      ),
      customFilterAndSearch: (term, row: Partial<TableData>) => {
        const temp = row?.type ?? '';
        return temp.toLowerCase().indexOf(term.toLowerCase()) > -1;
      },
      customSort: (row1: Partial<TableData>, row2: Partial<TableData>) => {
        const a = row1.type ?? '';
        const b = row2.type ?? '';
        return a > b ? 1 : -1;
      },
    },
    {
      title: 'Name',
      field: 'col3',
      width: '30%',
      render: (row: Partial<TableData>) => (
        <Typography style={{ fontSize: 'small', color: 'grey' }}>
          {row.name}
        </Typography>
      ),
      customFilterAndSearch: (term, row: Partial<TableData>) => {
        const temp = row?.name ?? '';
        return temp.toLowerCase().indexOf(term.toLowerCase()) > -1;
      },
      customSort: (row1: Partial<TableData>, row2: Partial<TableData>) => {
        const a = row1.name ?? '';
        const b = row2.name ?? '';
        return a > b ? 1 : -1;
      },
    },
    {
      title: 'Module',
      field: 'col4',
      width: '20%',
      render: (row: Partial<TableData>) => (
        <Typography style={{ fontSize: 'small', color: 'grey' }}>
          {row.module}
        </Typography>
      ),
      customFilterAndSearch: (term, row: Partial<TableData>) => {
        const temp = row?.module ?? '';
        return temp.toLowerCase().indexOf(term.toLowerCase()) > -1;
      },
      customSort: (row1: Partial<TableData>, row2: Partial<TableData>) => {
        const a = row1.module ?? '';
        const b = row2.module ?? '';
        return a > b ? 1 : -1;
      },
    },
  ];

  return (
    <Table
      options={{
        paging: true,
        filtering: false,
        emptyRowsWhenPaging: false,
        pageSize: pageSize,
        pageSizeOptions: [5, 10, 25],
      }}
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
      title="Workspace Resources"
      page={page}
      onPageChange={handleChangePage}
      totalCount={totalElements}
      onRowsPerPageChange={handleChangeRowsPerPage}
    />
  );
};

export default ResourceTable;
