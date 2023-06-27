import React, { useCallback } from 'react';
import { Box, CircularProgress, Link, Typography } from '@material-ui/core';
import {
  Table,
  TableColumn,
  StatusError,
  StatusOK,
  StatusRunning,
  StatusWarning,
  StatusAborted,
} from '@backstage/core-components';
import { durationHumanized, relativeTimeTo } from '../../util';
import RetryIcon from '@material-ui/icons/Replay';
import { PrintCard } from './ExecutionTableColumns';
import { AsyncStatus, TableData } from '../types';
import { AlertDialog } from './AlertDialog';

const getStatusComponent = (status: string | undefined = '') => {
  switch (status.toLocaleLowerCase('en-US')) {
    case 'running':
      return <StatusRunning />;
    case 'failed':
      return <StatusError />;
    case 'success':
      return <StatusOK />;
    case 'aborted':
      return <StatusAborted />;
    case 'skipped':
      return <StatusAborted />;
    default:
      return <StatusWarning />;
  }
};

const stringsMap: Record<string, string> = {
  Aborted: 'Aborted',
  Discontinuing: 'Aborted',
  Running: 'Running',
  AsyncWaiting: 'Running',
  TaskWaiting: 'Running',
  TimedWaiting: 'Running',
  Failed: 'Failed',
  Errored: 'Failed',
  NotStarted: 'NotStarted',
  Expired: 'Expired',
  Queued: 'Queued',
  Paused: 'Paused',
  ResourceWaiting: 'Waiting',
  Skipped: 'Skipped',
  Success: 'Success',
  IgnoreFailed: 'Success',
  Suspended: 'Suspended',
  Pausing: 'Pausing',
  ApprovalRejected: 'ApprovalRejected',
  InterventionWaiting: 'Waiting',
  ApprovalWaiting: 'ApprovalWaiting',
  InputWaiting: 'Waiting',
  WaitStepRunning: 'Waiting',
};

const ExecutionTable: React.FC<any> = ({
  baseUrl1,
  accountId,
  licenses,
  orgId,
  currProject,
  boolDisableRunPipeline,
  backendBaseUrl,
  setRefresh,
  refresh,
  pageSize,
  currTableData,
  setState,
  page,
  handleChangePage,
  totalElements,
  handleChangeRowsPerPage,
  classes,
  runPipeline,
}) => {
  const columns: TableColumn[] = [
    {
      title: 'NO',
      field: 'id',
      type: 'numeric',
      width: '5%',
      align: 'left',
      cellStyle: {
        paddingLeft: '30px',
      },
      render: (row: Partial<TableData>) => {
        const link = `${baseUrl1}/ng/#/account/${accountId}/${licenses}/orgs/${orgId}/projects/${currProject}/pipelines/${row.pipelineId}/deployments/${row.planExecutionId}/pipeline`;
        const id = parseInt(row.id ? row.id : '0', 10);
        return (
          <Link href={link} target="_blank">
            <b>{id}</b>
          </Link>
        );
      },
    },
    {
      title: 'Pipeline Name',
      field: 'col1',
      width: '22%',
      render: (row: Partial<TableData>) => {
        const link = `${baseUrl1}/ng/#/account/${accountId}/${licenses}/orgs/${orgId}/projects/${currProject}/pipelines/${row.pipelineId}/deployments/${row.planExecutionId}/pipeline`;
        return (
          <Typography style={{ fontSize: 'small', color: 'grey' }}>
            <Link href={link} target="_blank" style={{ fontSize: '0.9rem' }}>
              <b>{row.name} </b>
            </Link>
            <br />
            Run ID: {row?.runSequence}
          </Typography>
        );
      },

      customFilterAndSearch: (term, row: Partial<TableData>) => {
        const temp = `${row?.name} ${row?.runSequence}` ?? '';
        return temp.toLowerCase().indexOf(term.toLowerCase()) > -1;
      },
      customSort: (row1: Partial<TableData>, row2: Partial<TableData>) => {
        const a = row1.name ?? '';
        const b = row2.name ?? '';
        return a > b ? 1 : -1;
      },
    },
    {
      title: 'Pipeline Status',
      field: 'col2',
      width: '18%',
      render: useCallback(
        (row: Partial<TableData>) => (
          <Box display="flex" alignItems="center">
            {getStatusComponent(stringsMap[row?.status ?? 'Failed'])}
            <Box mr={1} />
            <Typography variant="button">
              {stringsMap[row?.status ?? 'Failed']}
            </Typography>
          </Box>
        ),
        [],
      ),
      customFilterAndSearch: (term, row: Partial<TableData>) => {
        const temp = row?.status ?? '';
        return temp.toLowerCase().indexOf(term.toLowerCase()) > -1;
      },
      customSort: (row1: Partial<TableData>, row2: Partial<TableData>) => {
        const a = row1.status ?? '';
        const b = row2.status ?? '';
        return a > b ? 1 : -1;
      },
    },
    {
      title: 'Details',
      field: 'col3',
      width: '30%',
      sorting: false,
      render: useCallback(
        (row: Partial<TableData>) => <PrintCard props={row} />,
        [],
      ),
    },
    {
      title: 'Pipeline time',
      field: 'col4',
      type: 'date',
      width: '20%',
      render: useCallback((row: Partial<TableData>) => {
        if (
          durationHumanized(
            new Date(Number(row.startTime)),
            new Date(Number(row.endTime)),
          ) === 'NaN years'
        ) {
          return (
            <>
              <Typography style={{ fontSize: '0.9rem' }}>
                {new Date(Number(row.startTime)).toUTCString()}
              </Typography>
              <Typography variant="body2">
                run {relativeTimeTo(new Date(Number(row.startTime)))}
              </Typography>
            </>
          );
        }
        return (
          <>
            <Typography style={{ fontSize: '0.9rem' }}>
              {new Date(Number(row.startTime)).toUTCString()}
            </Typography>
            <Typography variant="body2">
              run {relativeTimeTo(new Date(Number(row.startTime)))}
            </Typography>
            <Typography variant="body2">
              took{' '}
              {durationHumanized(
                new Date(Number(row.startTime)),
                new Date(Number(row.endTime)),
              )}
            </Typography>
          </>
        );
      }, []),
      customSort: (row1: Partial<TableData>, row2: Partial<TableData>) => {
        const a = row1.startTime ?? '';
        const b = row2.startTime ?? '';
        return a > b ? 1 : -1;
      },
      customFilterAndSearch: (term, row: Partial<TableData>) => {
        const temp = new Date(Number(row.startTime)).toUTCString();
        return temp.toLowerCase().indexOf(term.toLowerCase()) > -1;
      },
    },
  ];

  if (!boolDisableRunPipeline) {
    columns.push({
      title: 'Run Pipeline',
      field: 'col5',
      sorting: false,
      width: '5%',
      render: (row: Partial<TableData>) => {
        const query1 = new URLSearchParams({
          accountIdentifier: `${accountId}`,
          routingId: `${accountId}`,
          orgIdentifier: `${orgId}`,
          projectIdentifier: `${currProject}`,
        }).toString();
        return (
          <AlertDialog
            row={row}
            backendBaseUrl={backendBaseUrl}
            query1={query1}
            setRefresh={setRefresh}
            refresh={refresh}
            runPipeline={runPipeline}
          />
        );
      },
    });
  }

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
            setState(AsyncStatus.Loading);
          },
        },
      ]}
      emptyContent={
        <div className={classes.empty}>
          <CircularProgress />
        </div>
      }
      title="Execution History"
      page={page}
      onPageChange={handleChangePage}
      totalCount={totalElements}
      onRowsPerPageChange={handleChangeRowsPerPage}
    />
  );
};

export default ExecutionTable;
