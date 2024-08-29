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

import Grid from '@mui/material/Grid';
import { makeStyles } from '@mui/styles';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import FormHelperText from '@mui/material/FormHelperText';

import SyncIcon from '@mui/icons-material/Sync';
import LaunchIcon from '@mui/icons-material/Launch';
import CircleIcon from '@mui/icons-material/Circle';

import RunExperimentButton from '../RunExperimentButton';
import { StatusHeatMap } from '../StatusHeatMap/StatusHeatMap';
import { timeDifference } from '../../utils/getTimeDifference';
import useGetExperimentsList from '../../api/useListExperiments';
import { ExperimentRunStatus, InfrastructureType } from '../../api/types';
import { getInfraIconColor, orderExecutions } from '../../utils/tableUtils';
import { getExperimentLink, getInfrastructureLink } from '../../utils/links';
import {
  useGetNetworkMapEntity,
  useGetServiceEntity,
} from '../../hooks/useGetSlugsFromEntity';

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
  label: {
    marginBottom: '2px',
    fontSize: '14px !important',
  },
});

const columns: TableColumn[] = [
  { field: 'name', title: 'name', width: '20%' },
  { field: 'infra', title: 'application map', width: '20%' },
  { field: 'runs', title: 'recent experiment runs', width: '26%' },
  { field: 'updatedBy', title: 'last updated by', width: '22%' },
  { field: 'execute', title: '', width: '6%' },
  { field: 'launch', title: '', width: '6%' },
];

export const ChaosExperimentV2Table = (props: ChaosExperimentTableProps) => {
  const classes = useStyles();
  const discoveryApi = useApi(discoveryApiRef);
  const backendBaseUrl = discoveryApi.getBaseUrl('proxy');
  const harnessChaosServices = useGetServiceEntity();
  const harnessChaosNM = useGetNetworkMapEntity();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const allServices = Object.keys(harnessChaosServices);
  const allNMs = Object.keys(harnessChaosNM).map(key => {
    return {
      label: key,
      value: harnessChaosNM[key],
    };
  });

  const [selectedNM, setSelectedNM] = useState<string>(allNMs[0].value);

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
        tags: [selectedNM],
      },
    });

  if (error) {
    return <ErrorPanel error={error} />;
  }

  const ServiceDropDown =
    allServices && allServices?.length > 1 ? (
      <FormControl fullWidth>
        <InputLabel
          htmlFor="Service"
          classes={{
            root: classes.label,
          }}
        >
          Service
        </InputLabel>
        <Select labelId="Service" id="Service" value={allServices[0]}>
          {allServices.map(serv => (
            <MenuItem value={serv}>{serv}</MenuItem>
          ))}
        </Select>
        <FormHelperText />
      </FormControl>
    ) : null;

  const NMDropDown =
    allNMs && allNMs?.length > 1 ? (
      <FormControl fullWidth>
        <InputLabel
          htmlFor="Application Map"
          classes={{
            root: classes.label,
          }}
        >
          Application Map
        </InputLabel>
        <Select
          labelId="Application Map"
          id="Application Map"
          value={selectedNM}
          onChange={e => setSelectedNM(e.target.value)}
        >
          {allNMs.map(nm => (
            <MenuItem value={nm.value}>{nm.label}</MenuItem>
          ))}
        </Select>
        <FormHelperText />
      </FormControl>
    ) : null;

  const DropDownComponent = (
    <Grid margin={1} container spacing={3}>
      <Grid item md={3}>
        {NMDropDown}
      </Grid>
      <Grid item md={3}>
        {ServiceDropDown}
      </Grid>
    </Grid>
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
          <div className={classes.infraIconBox}>
            <CircleIcon
              fontSize="inherit"
              color={getInfraIconColor(infrastructure?.isActive)}
            />
            <Typography
              sx={{ display: 'inline' }}
              component="span"
              paddingLeft="4px"
              variant="body2"
              color="white"
              display="inline"
            >
              {infrastructure?.name || 'N/A'}
            </Typography>
          </div>
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
                {experiment.updatedBy?.username || 'Chaos Controller'}
              </Typography>
            </React.Fragment>
          }
          secondary={
            <React.Fragment>
              <Typography
                sx={{ display: 'inline' }}
                component="span"
                variant="caption"
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
      {DropDownComponent}
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
