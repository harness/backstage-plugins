import React, { useState } from 'react';
import {
  EmptyState,
  ErrorPanel,
  Link,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { discoveryApiRef, useApi } from '@backstage/core-plugin-api';
import { cloneDeep } from 'lodash-es';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LaunchIcon from '@mui/icons-material/Launch';
import SyncIcon from '@mui/icons-material/Sync';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import Typography from '@mui/material/Typography';
// eslint-disable-next-line no-restricted-imports
import {
  OutlinedInput,
  InputLabel,
  Select,
  FormControl,
  Stack,
} from '@mui/material';
import { ListItemText, makeStyles, MenuItem, Chip } from '@material-ui/core';
import {
  ExperimentRunStatus,
  InfrastructureType,
  RecentWorkflowRun,
} from '../../api/types';
import useGetExperimentsList from '../../api/useListExperiments';
import { StatusHeatMap } from '../StatusHeatMap/StatusHeatMap';
import { timeDifference } from '../../utils/getTimeDifference';
import RunExperimentButton from '../RunExperimentButton';

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

const allInfrastructures = [
  {
    label: 'Kubernetes (Legacy)',
    value: 'Kubernetes',
  },
  {
    label: 'Kubernetes (Harness Infrastructure)',
    value: 'KubernetesV2',
  },
  {
    label: 'Linux',
    value: 'Linux',
  },
  {
    label: 'Windows',
    value: 'Windows',
  },
];

export const ChaosExperimentV1Table = (props: ChaosExperimentTableProps) => {
  const discoveryApi = useApi(discoveryApiRef);
  const backendBaseUrl = discoveryApi.getBaseUrl('proxy');

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [infrastructures, setInfrastructures] = useState<string[]>([]);

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
      infrastructures,
    });

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
        <RunExperimentButton
          canNextRun={canNextRun}
          experimentId={experiment.workflowID}
          refetch={refetch}
        />
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
    <>
      <FormControl sx={{ m: 1, minWidth: 350 }}>
        <InputLabel>Select Infrastructures</InputLabel>
        <Select
          multiple
          style={{ height: '60px' }}
          value={infrastructures}
          onChange={e => setInfrastructures(e.target.value as string[])}
          input={<OutlinedInput label="Select Infrastructures" />}
          IconComponent={
            infrastructures.length > 0
              ? () => (
                  <IconButton
                    style={{ marginRight: '12px' }}
                    onClick={() => setInfrastructures([])}
                  >
                    <ClearIcon color="error" />
                  </IconButton>
                )
              : undefined
          }
          renderValue={selected => (
            <Stack direction="row" flexWrap="wrap">
              {selected.map(value => (
                <Chip
                  key={value}
                  label={
                    allInfrastructures.find(infra => infra.value === value)
                      ?.label
                  }
                  onDelete={() =>
                    setInfrastructures(
                      infrastructures.filter(item => item !== value),
                    )
                  }
                  deleteIcon={
                    <CancelIcon
                      onMouseDown={event => event.stopPropagation()}
                    />
                  }
                />
              ))}
            </Stack>
          )}
        >
          {allInfrastructures.map(infra => (
            <MenuItem key={infra.label} value={infra.value}>
              {infra.label}
              {infrastructures.includes(infra.value) ? (
                <CheckIcon color="info" />
              ) : null}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

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
    </>
  );
};
