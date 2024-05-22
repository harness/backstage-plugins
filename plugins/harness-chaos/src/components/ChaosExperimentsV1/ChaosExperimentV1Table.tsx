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

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { makeStyles } from '@mui/styles';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import OutlinedInput from '@mui/material/OutlinedInput';

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
  chip: {
    marginBottom: 0,
    marginRight: '8px',
    background: 'grey',
    borderRadius: '12px',
  },
  infraDropDownLabel: { fontSize: '14px !important', marginRight: '4px' },
  menuItem: {
    display: 'inline-flex',
    padding: '6px 8px',
    justifyContent: 'flex-start',
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
      infrastructures,
    });

  if (error) {
    return <ErrorPanel error={error} />;
  }

  const infrastructureSelector = (
    <FormControl sx={{ m: 1, minWidth: 350 }}>
      <InputLabel size="small">Filter Infrastructures</InputLabel>
      <Select
        size="small"
        multiple
        value={infrastructures}
        onChange={e => setInfrastructures(e.target.value as string[])}
        input={<OutlinedInput label="Filter Infrastructures" />}
        MenuProps={{
          PaperProps: {
            sx: {
              '& .MuiList-root': {
                display: 'flex',
                flexDirection: 'column',
              },
            },
          },
        }}
        IconComponent={
          infrastructures.length > 0
            ? () => (
                <IconButton
                  sx={{ marginRight: '8px !important' }}
                  size="small"
                  onClick={() => setInfrastructures([])}
                >
                  <ClearIcon color="error" fontSize="small" />
                </IconButton>
              )
            : undefined
        }
        renderValue={selected => (
          <Stack direction="row" flexWrap="wrap">
            {selected.map(value => (
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
          </Stack>
        )}
      >
        {allInfrastructures.map(infra => (
          <MenuItem
            className={classes.menuItem}
            key={infra.label}
            value={infra.value}
          >
            <Typography className={classes.infraDropDownLabel}>
              {infra.label}
            </Typography>
            {infrastructures.includes(infra.value) ? (
              <CheckIcon color="info" fontSize="small" />
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
              <Typography
                sx={{ display: 'inline' }}
                component="span"
                variant="body2"
                color="white"
                display="inline"
              >
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
                sx={{ display: 'inline', paddingLeft: '4px' }}
                component="span"
                variant="caption"
                fontSize="0.3rem"
                color="white"
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
                fontSize="0.3rem"
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
