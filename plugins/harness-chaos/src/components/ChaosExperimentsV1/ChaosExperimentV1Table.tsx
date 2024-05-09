import { Link, Table, TableColumn } from '@backstage/core-components';
import React, { useState } from 'react';
import { ErrorPanel, Progress } from '@backstage/core-components';
import { discoveryApiRef, useApi } from '@backstage/core-plugin-api';
import { cloneDeep } from 'lodash-es';
import parser from 'cron-parser';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LaunchIcon from '@mui/icons-material/Launch';
import SyncIcon from '@mui/icons-material/Sync';
import useGetExperimentsList from '../../api/useListExperiments';

import { makeStyles } from '@material-ui/core';
import { ExperimentRunStatus, RecentExecutions } from '../../api/types';

export const useStyles = makeStyles({
  gridItemCard: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100% - 10px)', // for pages without content header
    marginBottom: '10px',
  },
});

const columns: TableColumn[] = [
  { field: 'name', title: 'name' },
  { field: 'nextRun', title: 'next run' },
  { field: 'runs', title: 'recent experiment runs' },
  { field: 'infra', title: 'infra' },
  { field: 'execute', title: '' },
  { field: 'launch', title: '' },
];

interface ChaosExperimentTableProps {
  accountId: string;
  orgId: string;
  projectId: string;
  env: string;
}

export const ChaosExperimentV1Table = (props: ChaosExperimentTableProps) => {
  const discoveryApi = useApi(discoveryApiRef);
  const backendBaseUrl = discoveryApi.getBaseUrl('proxy');

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const handleChangePage = (currentPage: number, currentPageSize: number) => {
    setPage(currentPage);
    setPageSize(currentPageSize);
  };

  const handleChangeRowsPerPage = (currentPageSize: number) => {
    setPage(0);
    setPageSize(currentPageSize);
  };

  const classes = useStyles();
  const { experiments, totalExperiments, loading, error, refetch } =
    useGetExperimentsList({
      ...props,
      page,
      limit: pageSize,
      backendBaseUrl,
    });

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <ErrorPanel error={error} />;
  }

  function orderExecutions(data: RecentExecutions[]): RecentExecutions[] {
    let recentExecutions: RecentExecutions[] = cloneDeep(data);
    if (recentExecutions.length < 10) {
      const fillExecutions = Array(10 - recentExecutions.length).fill({
        phase: ExperimentRunStatus.NA,
      });
      recentExecutions = [...recentExecutions, ...fillExecutions];
    }
    return recentExecutions.reverse();
  }

  const data = experiments?.map(experiment => {
    const recentExecutions = experiment.recentWorkflowRunDetails?.[0];
    const canNextRun = !(
      recentExecutions?.phase === ExperimentRunStatus.RUNNING ||
      recentExecutions?.phase === ExperimentRunStatus.QUEUED
    );
    return {
      name: <div>{experiment.name}</div>,
      nextRun: (
        <div>
          {experiment.cronSyntax === ''
            ? ' Non-Cron'
            : parser.parseExpression(experiment.cronSyntax).next().toString()}
        </div>
      ),
      infra: (
        <Link to="#" target="_blank" underline="none" color="inherit">
          {experiment.infra.name}
        </Link>
      ),
      runs: (
        // <StatusHeatMap
        //   data={orderExecutions(experiment.recentExperimentRunDetails)}
        //   experimentID={experiment.workflowID}
        // />
        <>runs here</>
      ),
      execute: (
        <Tooltip title="Run Experiment">
          <IconButton onClick={() => void 0} disabled={!canNextRun}>
            <PlayArrowIcon sx={{ color: canNextRun ? '#1bb954' : '#6a6d85' }} />
          </IconButton>
        </Tooltip>
      ),
      launch: (
        <Tooltip title="Go to details">
          <IconButton href="#" target="_blank">
            <LaunchIcon />
          </IconButton>
        </Tooltip>
      ),
    };
  });

  return (
    <div className={classes.gridItemCard}>
      <Table
        title="Experiments"
        actions={[
          {
            icon: () => <SyncIcon />,
            tooltip: 'Refresh',
            isFreeAction: true,
            onClick: refetch,
          },
        ]}
        options={{
          search: false,
          paging: true,
          padding: 'dense',
          emptyRowsWhenPaging: false,
          pageSize: pageSize,
          pageSizeOptions: [5, 10, 25],
        }}
        data={data || []}
        columns={columns}
        page={page}
        onPageChange={handleChangePage}
        totalCount={totalExperiments}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
};
