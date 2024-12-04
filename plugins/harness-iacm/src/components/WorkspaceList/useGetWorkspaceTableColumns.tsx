import { TableColumn } from '@backstage/core-components';
import { Link, Typography } from '@material-ui/core';
import React, { useMemo } from 'react';
import { TableData } from '../../types';

import Aws from '../../icons/aws';
import Azure from '../../icons/azure';
import Gcp from '../../icons/gcp';
import Kubernetes from '../../icons/kubernetes';
import { Output } from '../../hooks/useGetResources';
import CopyToClipboard from '../CopyToClipboard';

export const useGetWorkspaceTableColumns = ({
  baseUrl,
}: {
  baseUrl: string;
}) => {
  const getProviderIcon = (name?: string): React.ReactNode => {
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
  const resourceColumns: TableColumn[] = useMemo(
    () => [
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
              key={row.id}
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
    ],
    [baseUrl],
  );

  const outputsColumns: TableColumn[] = useMemo(
    () => [
      {
        title: 'Name',
        field: 'col3',
        width: '30%',
        render: (row: Partial<Output>) => (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              style={{ fontSize: 'small', color: 'grey', paddingRight: '5px' }}
            >
              {row.name}
            </Typography>
            <CopyToClipboard copyValue={row.name} />
          </div>
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
        title: 'Value',
        field: 'col2',
        width: '70%',
        render: (row: Partial<Output>) => (
          <span style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <Typography style={{ fontSize: 'small', color: 'grey' }}>
              {row.value}
            </Typography>
            <CopyToClipboard copyValue={row.value} />
          </span>
        ),
        customFilterAndSearch: (term, row: Partial<Output>) => {
          const temp = row?.value ?? '';
          return temp.toLowerCase().indexOf(term.toLowerCase()) > -1;
        },
        customSort: (row1: Partial<Output>, row2: Partial<Output>) => {
          const a = row1.value ?? '';
          const b = row2.value ?? '';
          return a > b ? 1 : -1;
        },
      },
    ],
    [],
  );
  return {
    resourceColumns,
    outputsColumns,
  };
};
