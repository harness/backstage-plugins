import { Link, Table, TableColumn } from '@backstage/core-components';
import React, { useState } from 'react';
import { ErrorPanel, Progress } from '@backstage/core-components';
import { discoveryApiRef, useApi } from '@backstage/core-plugin-api';
import { cloneDeep } from 'lodash-es';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LaunchIcon from '@mui/icons-material/Launch';
import SyncIcon from '@mui/icons-material/Sync';
import useGetExperimentsList from '../../api/useListExperiments';
import Typography from '@mui/material/Typography';
import { ListItemText, makeStyles } from '@material-ui/core';
import {
  ExperimentRunStatus,
  InfrastructureType,
  RecentWorkflowRun,
} from '../../api/types';
import { StatusHeatMap } from '../StatusHeatMap/StatusHeatMap';
import { timeDifference } from '../../utils/getTimeDifference';

export const useStyles = makeStyles({
  gridItemCard: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100% - 10px)', // for pages without content header
    marginBottom: '10px',
  },
});

const columns: TableColumn[] = [
  { field: 'name', title: 'name', width: '20%' },
  { field: 'infra', title: 'infra', width: '20%' },
  { field: 'runs', title: 'recent experiment runs', width: '26%' },
  { field: 'updatedBy', title: 'last updated by', width: '22%' },
  { field: 'execute', title: '', width: '6%' },
  { field: 'launch', title: '', width: '6%' },
];

interface ChaosExperimentTableProps {
  accountId: string;
  orgId: string;
  projectId: string;
  env: string;
  baseUrl: string;
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

  const getExperimentLink = (expId: string) =>
    `${props.baseUrl}/ng/account/${props.accountId}/chaos/orgs/${props.orgId}/projects/${props.projectId}/experiments/${expId}`;

  const getInfrastructureLink = (
    infraId?: string,
    environmentId?: string,
    infraType?: InfrastructureType,
  ) => {
    if (!infraId || !environmentId || !infraType) return '#';
    return `${props.baseUrl}/ng/account/${props.accountId}/chaos/orgs/${
      props.orgId
    }/projects/${
      props.projectId
    }/environments/${environmentId}/${infraType?.toLowerCase()}/${infraId}`;
  };

  function orderExecutions(data: RecentWorkflowRun[]): RecentWorkflowRun[] {
    let recentExecutions: RecentWorkflowRun[] = cloneDeep(data);
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
      infra: (
        <Link
          to={
            experiment.infra?.infraType !== InfrastructureType.KUBERNETESV2
              ? getInfrastructureLink(
                  experiment.infra?.infraID,
                  experiment.infra?.environmentID,
                  experiment.infra?.infraType,
                )
              : '#'
          }
          target="_blank"
          underline="none"
          color="inherit"
        >
          <ListItemText
            primary={
              <React.Fragment>
                <Typography
                  sx={{ display: 'inline' }}
                  component="span"
                  variant="body2"
                  color="white"
                  display="inline"
                >
                  {experiment.infra?.name || 'N/A'}
                </Typography>
              </React.Fragment>
            }
            secondary={
              <React.Fragment>
                <Typography
                  sx={{ display: 'inline' }}
                  component="span"
                  variant="caption"
                  fontSize="0.5rem"
                  color="white"
                >
                  {experiment.infra?.infraType}
                </Typography>
              </React.Fragment>
            }
          />
        </Link>
      ),
      runs: (
        <StatusHeatMap
          data={orderExecutions(experiment.recentWorkflowRunDetails)}
          experimentID={experiment.workflowID}
        />
      ),
      updatedBy: (
        <ListItemText
          primary={
            <React.Fragment>
              <Typography
                sx={{
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  lineClamp: 1,
                }}
                variant="body2"
                color="white"
              >
                {experiment.updatedBy?.username}
              </Typography>
            </React.Fragment>
          }
          secondary={
            <React.Fragment>
              <Typography
                sx={{ display: 'inline' }}
                component="span"
                variant="caption"
                fontSize="0.5rem"
                color="white"
              >
                {timeDifference(
                  new Date().getTime(),
                  Number(experiment.updatedAt),
                )}
              </Typography>
            </React.Fragment>
          }
        />
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
          <IconButton
            href={getExperimentLink(experiment.workflowID)}
            target="_blank"
          >
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
