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
  Chip,
  FormControl,
  IconButton,
  Input,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Tooltip,
  Typography,
  makeStyles,
} from '@material-ui/core';

import SyncIcon from '@mui/icons-material/Sync';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import LaunchIcon from '@mui/icons-material/Launch';
import CancelIcon from '@mui/icons-material/Cancel';
import CircleIcon from '@mui/icons-material/Circle';

import RunExperimentButton from '../RunExperimentButton';
import { StatusHeatMap } from '../StatusHeatMap/StatusHeatMap';
import { timeDifference } from '../../utils/getTimeDifference';
import useGetExperimentsList from '../../api/useListExperiments';
import { ExperimentRunStatus, InfrastructureType } from '../../api/types';
import { getInfraIconColor, orderExecutions } from '../../utils/tableUtils';
import { getExperimentLink, getInfrastructureLink } from '../../utils/links';

interface ChaosExperimentTableProps {
  accountId: string;
  orgId: string;
  projectId: string;
  env: string;
  baseUrl: string;
}

export const useStyles = makeStyles(theme => ({
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
  formControl: {
    marginLeft: theme.spacing(1),
    minWidth: 300,
    height: 56,
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 2,
  },
  checkIcon: {
    marginLeft: '6px',
  },
  infraText: {
    paddingLeft: '4px',
  },
}));

const columns: TableColumn[] = [
  { field: 'name', title: 'name', width: '20%' },
  { field: 'infra', title: 'infra', width: '20%' },
  { field: 'runs', title: 'recent experiment runs', width: '26%' },
  { field: 'updatedBy', title: 'last updated by', width: '22%' },
  { field: 'execute', title: '', width: '6%' },
  { field: 'launch', title: '', width: '6%' },
];

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

const INFRA_ITEM_HEIGHT = 48;
const INFRA_ITEM_PADDING_TOP = 8;

export const ChaosExperimentV1Table = (props: ChaosExperimentTableProps) => {
  const classes = useStyles();
  const discoveryApi = useApi(discoveryApiRef);
  const backendBaseUrl = discoveryApi.getBaseUrl('proxy');

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [infrastructures, setInfrastructures] = useState<string[]>([]);

  const commonPropsForLinks = omit(props, 'env');

  const handleChangePage = (currentPage: number, currentPageSize: number) => {
    setPage(currentPage);
    setPageSize(currentPageSize);
  };

  const handleChangeRowsPerPage = (currentPageSize: number) => {
    setPage(0);
    setPageSize(currentPageSize);
  };

  const { experiments, totalExperiments, loading, error, refetch } =
    useGetExperimentsList({
      ...props,
      page,
      limit: pageSize,
      backendBaseUrl,
      filter: {
        infraTypes: infrastructures as InfrastructureType[],
      },
    });

  if (error) {
    return <ErrorPanel error={error} />;
  }

  const infrastructureSelector = (
    <FormControl className={classes.formControl}>
      <InputLabel>Filter Infrastructures</InputLabel>
      <Select
        multiple
        value={infrastructures}
        onChange={e => setInfrastructures(e.target.value as string[])}
        input={<Input />}
        renderValue={selected => (
          <div className={classes.chips}>
            {(selected as string[]).map(value => (
              <Chip
                key={value}
                size="small"
                className={classes.chip}
                label={
                  allInfrastructures.find(infra => infra.value === value)?.label
                }
                onDelete={() =>
                  setInfrastructures(
                    infrastructures.filter(item => item !== value),
                  )
                }
                deleteIcon={
                  <CancelIcon onMouseDown={event => event.stopPropagation()} />
                }
              />
            ))}
          </div>
        )}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: INFRA_ITEM_HEIGHT * 4.5 + INFRA_ITEM_PADDING_TOP,
              width: 350,
            },
          },
        }}
        IconComponent={
          infrastructures.length > 0
            ? () => (
                <IconButton size="small" onClick={() => setInfrastructures([])}>
                  <ClearIcon color="error" fontSize="small" />
                </IconButton>
              )
            : undefined
        }
      >
        {allInfrastructures.map(infra => (
          <MenuItem key={infra.value} value={infra.value}>
            {infra.label}
            {infrastructures.includes(infra.value) ? (
              <CheckIcon
                className={classes.checkIcon}
                color="info"
                fontSize="small"
              />
            ) : null}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  const data = experiments?.map(experiment => {
    const recentExecutions = experiment.recentWorkflowRunDetails?.[0];
    const canNextRun = !(
      recentExecutions?.phase === ExperimentRunStatus.RUNNING ||
      recentExecutions?.phase === ExperimentRunStatus.QUEUED
    );
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
      {infrastructureSelector}
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
