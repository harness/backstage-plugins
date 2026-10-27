import React, { useState } from 'react';
import { omit } from 'lodash-es';

import {
  EmptyState,
  ErrorPanel,
  Link,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { discoveryApiRef, useApi } from '@backstage/core-plugin-api';

import {
  IconButton,
  ListItemText,
  Tooltip,
  Typography,
  makeStyles,
} from '@material-ui/core';

import SyncIcon from '@mui/icons-material/Sync';
import LaunchIcon from '@mui/icons-material/Launch';
import CircleIcon from '@mui/icons-material/Circle';
import AssessmentIcon from '@mui/icons-material/Assessment';

import RunExperimentButton from '../RunExperimentButton';
import { InfrastructureFilter } from '../InfrastructureFilter/InfrastructureFilter';
import { StatusHeatMap } from '../StatusHeatMap/StatusHeatMap';
import { timeDifference } from '../../utils/getTimeDifference';
import useGetExperimentsList from '../../api/useListExperiments';
import { ExperimentRunStatus, InfrastructureType } from '../../api/types';
import {
  getInfraIconColor,
  getLatestScore,
  getResilienceScoreColor,
  orderExecutions,
} from '../../utils/tableUtils';
import {
  getExperimentLink,
  getExperimentRunReportLink,
  getInfrastructureLink,
} from '../../utils/links';
import { useEntityTag } from '../../hooks/useGetSlugsFromEntity';
import useAverageResilienceScore from '../../api/useAverageResilienceScore';
import { ResilienceScoreBadge } from '../ResilienceScoreBadge/ResilienceScoreBadge';

interface ChaosExperimentTableProps {
  accountId: string;
  orgId: string;
  projectId: string;
  env: string;
  baseUrl: string;
}

export const useStyles = makeStyles({
  gridItemCard: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100% - 10px)',
    marginTop: '10px',
    marginBottom: '10px',
  },
  empty: {
    padding: '2rem',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: '#333333',
  },
  infraIconBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    fontSize: '11px',
  },
  infraText: {
    paddingLeft: '4px',
  },
  resilienceScore: {
    fontWeight: 600,
  },
});

const columns: TableColumn[] = [
  { field: 'name', title: 'name', width: '15%' },
  { field: 'infra', title: 'infra', width: '14%' },
  { field: 'resilienceScore', title: 'resilience score', width: '10%' },
  { field: 'runs', title: 'recent experiment runs', width: '22%' },
  { field: 'report', title: 'report', width: '6%' },
  { field: 'updatedBy', title: 'last updated by', width: '18%' },
  { field: 'execute', title: '', width: '5%' },
  { field: 'launch', title: '', width: '5%' },
];

export const ChaosExperimentV1Table = (props: ChaosExperimentTableProps) => {
  const classes = useStyles();
  const discoveryApi = useApi(discoveryApiRef);
  const backendBaseUrl = discoveryApi.getBaseUrl('proxy');
  const entityTag = useEntityTag();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [selectedInfrastructure, setSelectedInfrastructure] =
    useState<string>('');

  const commonPropsForLinks = omit(props, 'env');

  const handleChangePage = (currentPage: number, currentPageSize: number) => {
    setPage(currentPage);
    setPageSize(currentPageSize);
  };

  const handleChangeRowsPerPage = (currentPageSize: number) => {
    setPage(0);
    setPageSize(currentPageSize);
  };

  const filter = {
    infraTypes: (selectedInfrastructure
      ? [selectedInfrastructure]
      : []) as InfrastructureType[],
    ...(entityTag ? { tags: [entityTag] } : {}),
  };

  const { experiments, totalExperiments, loading, error, refetch } =
    useGetExperimentsList({
      ...props,
      page,
      limit: pageSize,
      backendBaseUrl,
      filter,
    });

  const {
    summary: scoreSummary,
    error: averageError,
    loading: averageLoading,
    refetch: refetchAverage,
  } = useAverageResilienceScore({ ...props, backendBaseUrl, filter });

  if (error) {
    return <ErrorPanel error={error} />;
  }

  const infrastructureSelector = (
    <InfrastructureFilter
      value={selectedInfrastructure}
      onChange={value => {
        setSelectedInfrastructure(value);
        setPage(0);
      }}
    />
  );

  const data = experiments?.map(experiment => {
    const recentExecutions = experiment.recentWorkflowRunDetails?.[0];
    const canNextRun = !(
      recentExecutions?.phase === ExperimentRunStatus.RUNNING ||
      recentExecutions?.phase === ExperimentRunStatus.QUEUED
    );
    const latestScore = getLatestScore(experiment.recentWorkflowRunDetails);
    const infrastructure = experiment.infra;
    return {
      name: <div>{experiment.name}</div>,
      infra: (
        <ListItemText
          primary={
            <Link
              to={
                infrastructure?.infraType !== InfrastructureType.KUBERNETESV2
                  ? getInfrastructureLink(
                      commonPropsForLinks,
                      infrastructure?.infraID,
                      infrastructure?.environmentID,
                      infrastructure?.infraType,
                    )
                  : '#'
              }
              target="_blank"
              style={{
                pointerEvents: infrastructure?.infraID ? 'auto' : 'none',
              }}
              underline="none"
              color="inherit"
            >
              <Typography variant="body2">
                {infrastructure?.name || 'N/A'}
              </Typography>
            </Link>
          }
          secondary={
            <div className={classes.infraIconBox}>
              <CircleIcon
                fontSize="inherit"
                color={getInfraIconColor(infrastructure?.isActive)}
              />
              <Typography
                component="span"
                variant="caption"
                className={classes.infraText}
              >
                {infrastructure?.infraType}
              </Typography>
            </div>
          }
        />
      ),
      resilienceScore:
        latestScore !== undefined ? (
          <Typography
            variant="body2"
            style={{ color: getResilienceScoreColor(latestScore) }}
            className={classes.resilienceScore}
          >
            {latestScore} / 100
          </Typography>
        ) : (
          <Typography variant="body2" color="textSecondary">
            N/A
          </Typography>
        ),
      runs: (
        <StatusHeatMap
          data={orderExecutions(experiment.recentWorkflowRunDetails)}
          experimentID={experiment.workflowID}
        />
      ),
      report: recentExecutions?.workflowRunID ? (
        <Tooltip title="View experiment report">
          <IconButton
            href={getExperimentRunReportLink(
              commonPropsForLinks,
              experiment.workflowID,
              recentExecutions.workflowRunID,
            )}
            target="_blank"
          >
            <AssessmentIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Typography variant="body2" color="textSecondary">
          —
        </Typography>
      ),
      updatedBy: (
        <ListItemText
          primary={
            <React.Fragment>
              <Typography variant="body2">
                {experiment.updatedBy?.username || 'Chaos Controller'}
              </Typography>
            </React.Fragment>
          }
          secondary={
            <React.Fragment>
              <Typography component="span" variant="caption">
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
        <RunExperimentButton
          canNextRun={canNextRun}
          experimentId={experiment.workflowID}
          refetch={refetch}
        />
      ),
      launch: (
        <Tooltip title="Go to details">
          <IconButton
            href={getExperimentLink(commonPropsForLinks, experiment.workflowID)}
            target="_blank"
          >
            <LaunchIcon />
          </IconButton>
        </Tooltip>
      ),
    };
  });

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}
      >
        {infrastructureSelector}
        <ResilienceScoreBadge
          summary={scoreSummary}
          error={averageError}
          loading={averageLoading}
        />
      </div>
      <div className={classes.gridItemCard}>
        <Table
          isLoading={loading}
          emptyContent={
            <div className={classes.empty}>
              <EmptyState
                title="No Chaos Experiments in your project"
                missing="content"
              />
            </div>
          }
          title="Experiments"
          actions={[
            {
              icon: () => <SyncIcon />,
              tooltip: 'Refresh',
              isFreeAction: true,
              onClick: () => {
                refetch();
                refetchAverage();
              },
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
    </>
  );
};
