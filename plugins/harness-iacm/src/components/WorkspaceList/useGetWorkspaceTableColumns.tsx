import { TableColumn } from '@backstage/core-components';
import { Button, Link, Typography, makeStyles } from '@material-ui/core';
import React, { useMemo, useState } from 'react';
import { TableData } from '../../types';

import Aws from '../../icons/aws';
import Azure from '../../icons/azure';
import Gcp from '../../icons/gcp';
import Kubernetes from '../../icons/kubernetes';
import { Output } from '../../hooks/useGetResources';
import CopyToClipboard from '../CopyToClipboard';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';

const useStyles = makeStyles(theme => ({
  container: {
    width: '100%',
  },
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
  },
  smallGreyText: {
    fontSize: 'small',
    color: 'grey',
  },
  gap: {
    display: 'flex',
    gap: theme.spacing(0.5),
  },
  iconButton: {
    color: '#0A6EBE',
    width: 15,
    height: 15,
  },
  paddingRightSmall: {
    paddingRight: theme.spacing(0.5),
  },
}));

export const useGetWorkspaceTableColumns = ({
  baseUrl,
}: {
  baseUrl: string;
}) => {
  const classes = useStyles();

  const getProviderIcon = (name?: string): React.ReactNode => {
    if (!name) return <Aws />;
    if (name.includes('aws')) return <Aws />;
    if (name.includes('azure')) return <Azure />;
    if (name.includes('gcp') || name.includes('google')) return <Gcp />;
    if (name.includes('kubernetes') || name.includes('k8s'))
      return <Kubernetes />;
    return null;
  };

  const resourceColumns: TableColumn[] = useMemo(
    () => [
      {
        title: 'Provider',
        field: 'col1',
        width: '22%',
        render: (row: Partial<TableData>) => (
          <Link
            href={baseUrl}
            target="_blank"
            className={classes.flexCenter}
            key={row.id}
          >
            <b>{row.provider}</b>
          </Link>
        ),
        customFilterAndSearch: (term, row: Partial<TableData>) =>
          (row.provider ?? '').toLowerCase().includes(term.toLowerCase()),
        customSort: (row1: Partial<TableData>, row2: Partial<TableData>) =>
          (row1.provider ?? '').localeCompare(row2.provider ?? ''),
      },
      {
        title: 'Type',
        field: 'col2',
        width: '18%',
        render: (row: Partial<TableData>) => (
          <span className={classes.gap}>
            {getProviderIcon(row.provider)}
            <Typography className={classes.smallGreyText}>
              {row.type}
            </Typography>
          </span>
        ),
        customFilterAndSearch: (term, row: Partial<TableData>) =>
          (row.type ?? '').toLowerCase().includes(term.toLowerCase()),
        customSort: (row1: Partial<TableData>, row2: Partial<TableData>) =>
          (row1.type ?? '').localeCompare(row2.type ?? ''),
      },
      {
        title: 'Name',
        field: 'col3',
        width: '30%',
        render: (row: Partial<TableData>) => (
          <Typography className={classes.smallGreyText}>{row.name}</Typography>
        ),
        customFilterAndSearch: (term, row: Partial<TableData>) =>
          (row.name ?? '').toLowerCase().includes(term.toLowerCase()),
        customSort: (row1: Partial<TableData>, row2: Partial<TableData>) =>
          (row1.name ?? '').localeCompare(row2.name ?? ''),
      },
      {
        title: 'Module',
        field: 'col4',
        width: '20%',
        render: (row: Partial<TableData>) => (
          <Typography className={classes.smallGreyText}>
            {row.module}
          </Typography>
        ),
        customFilterAndSearch: (term, row: Partial<TableData>) =>
          (row.module ?? '').toLowerCase().includes(term.toLowerCase()),
        customSort: (row1: Partial<TableData>, row2: Partial<TableData>) =>
          (row1.module ?? '').localeCompare(row2.module ?? ''),
      },
    ],
    [baseUrl, classes],
  );

  const outputsColumns: TableColumn[] = useMemo(
    () => [
      {
        title: 'Name',
        field: 'col3',
        width: '30%',
        render: (row: Partial<Output>) => (
          <div className={classes.flexCenter}>
            <Typography
              className={`${classes.smallGreyText} ${classes.paddingRightSmall}`}
            >
              {row.name}
            </Typography>
            <CopyToClipboard copyValue={row.name} />
          </div>
        ),
        customFilterAndSearch: (term, row: Partial<Output>) =>
          (row.name ?? '').toLowerCase().includes(term.toLowerCase()),
        customSort: (row1: Partial<Output>, row2: Partial<Output>) =>
          (row1.name ?? '').localeCompare(row2.name ?? ''),
      },
      {
        title: 'Value',
        field: 'col2',
        width: '70%',
        render: (row: Partial<Output>) => {
          const isSensitive = row.sensitive;
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const [show, setShow] = useState(!isSensitive);
          return (
            <span className={classes.flexCenter}>
              <Typography className={classes.smallGreyText}>
                {show ? row.value : '********'}
              </Typography>
              {show && <CopyToClipboard copyValue={row.value} />}
              {isSensitive && (
                <Button onClick={() => setShow(!show)}>
                  {show ? (
                    <VisibilityOffIcon className={classes.iconButton} />
                  ) : (
                    <VisibilityIcon className={classes.iconButton} />
                  )}
                </Button>
              )}
            </span>
          );
        },
        customFilterAndSearch: (term, row: Partial<Output>) =>
          (row.value ?? '').toLowerCase().includes(term.toLowerCase()),
        customSort: (row1: Partial<Output>, row2: Partial<Output>) =>
          (row1.value ?? '').localeCompare(row2.value ?? ''),
      },
    ],
    [classes],
  );

  return {
    resourceColumns,
    outputsColumns,
  };
};
