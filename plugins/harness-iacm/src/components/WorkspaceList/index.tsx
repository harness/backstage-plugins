/* eslint-disable @backstage/no-undeclared-imports */
import React, { useCallback, useState, useMemo } from 'react';
import {
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  ListSubheader,
  makeStyles,
  MenuItem,
  Select,
  Tab,
  Tabs,
} from '@material-ui/core';
// eslint-disable-next-line no-restricted-imports
import { Grid } from '@mui/material';
import { discoveryApiRef, useApi } from '@backstage/core-plugin-api';
import { AsyncStatus } from '../../types';
import useGetResources, { DataSource, Resource } from '../../hooks/useGetResources';
import useProjectUrlSlugEntity from '../../hooks/useProjectUrlEntity';
import { useResourceSlugFromEntity } from './useResourceSlugFromEntity';
import { EmptyState } from '@backstage/core-components';
import WorkspaceTable from '../WorkspaceTable';
import { getCurrTableData, getTotalElements } from '../../utils/getWorkspaceData';
import ResourceDetailDrawer from './ResourceDetailDrawer';

const useStyles = makeStyles(theme => ({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: '2px',
    fontSize: '1rem !important',
    fontWeight: 400,
  },
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
  select: {
    border: '1px solid gray ',
    paddingLeft: '5px',
    height: '56px',
    fontWeight: 400,
    fontSize: '1rem',
    color: 'rgba(0, 0, 0, 0.87)',
    borderRadius: '4px',
  },
  menuItem: {
    paddingLeft: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  noAccess: {
    padding: theme.spacing(2),
    display: 'flex',

    textAlign: 'center',
  },
  workspaceList: {
    marginTop: '-40px',
  },
  workspaceItem: { padding: '0.75rem', fontSize: '1rem' },
}));

export interface Workspace {
  identifier: string;
  name: string;
}

export enum WorkspaceDataType {
  Resource,
  DataSource,
  Output,
}

function WorkspaceList() {
  const [refresh, setRefresh] = useState(false);

  const classes = useStyles();
  const discoveryApi = useApi(discoveryApiRef);
  const backendBaseUrl = discoveryApi.getBaseUrl('proxy');

  const { isWorkspaceAnnotationPresent, harnessWorkspaceUrlObject } =
    useProjectUrlSlugEntity();

  const [selectedProjectUrl, setSelectedProjectUrl] = useState(() => {
    return Object.keys(harnessWorkspaceUrlObject)[0];
  });

  const [selectedResourceUrl, setSelectedResourceUrl] = useState(() => {
    return harnessWorkspaceUrlObject[Object.keys(harnessWorkspaceUrlObject)[0]];
  });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [selectedTab, setSelectedTab] = React.useState<WorkspaceDataType>(
    WorkspaceDataType.Resource,
  );
  const [selectedRowData, setSelectedRowData] = useState<Resource | DataSource | null>(null);

  const handleChange = (_event: unknown, resourceType: WorkspaceDataType) => {
    setSelectedTab(resourceType);
  };
  const drawerTitle = useMemo(() => {
    const driftStatus = selectedRowData?.drift_status || '';
    const capitalizedStatus = driftStatus ? driftStatus.charAt(0).toUpperCase() + driftStatus.slice(1) : '';
    return `${capitalizedStatus}  ${selectedTab === WorkspaceDataType.Resource ? 'Resources' : 'Data Sources'}`
  }, [selectedRowData, selectedTab]);
  const {
    projectId,
    orgId,
    accountId,
    envFromUrl,
    workspaceId,
    cleanedString: urlForWorkspace,
  } = useResourceSlugFromEntity(
    isWorkspaceAnnotationPresent,
    selectedResourceUrl,
  );

  const { resources: workspaceData, status: state } = useGetResources({
    backendBaseUrl,
    accountId,
    orgId,
    projectId,
    refresh,
    envFromUrl,
    workspace: workspaceId || null,
  });

  const { resources, outputs, data_sources: dataSources } = workspaceData || {};

  const workspaceDataObj = useMemo(
    () => ({
      resources,
      outputs,
      dataSources,
    }),
    [resources, outputs, dataSources],
  );

  const currTableData = useMemo(
    () => getCurrTableData(selectedTab, workspaceDataObj),
    [selectedTab, workspaceDataObj],
  );

  const totalElements = useMemo(
    () => getTotalElements(selectedTab, workspaceDataObj),
    [selectedTab, workspaceDataObj],
  );

  const handleWorkspaceChange = (event: any) => {
    setSelectedProjectUrl(event.target.value as string);

    setSelectedResourceUrl(harnessWorkspaceUrlObject[event.target.value]);
  };

  const handleChangePage = useCallback(
    (currentPage: number, currentPageSize: number) => {
      setPage(currentPage);
      setPageSize(currentPageSize);
    },
    [setPage, setPageSize],
  );

  const handleChangeRowsPerPage = useCallback(
    (currentPageSize: number) => {
      setPage(0);
      setPageSize(currentPageSize);
    },
    [setPage, setPageSize],
  );

  const handleRowClick = useCallback((data:  Resource  | DataSource) => {
    if(selectedTab === WorkspaceDataType.Output) return; //do not open drawer for outputs
    setSelectedRowData(data);
  }, [selectedTab]);

  const handleDrawerClose = useCallback(() => {
    setSelectedRowData(null); // clear data to close drawer
  }, []);

  const newWorkspaceDropdown = (
    <FormControl fullWidth>
      <InputLabel
        htmlFor="Service/Workspace"
        classes={{
          root: classes.label,
        }}
      >
        Service / Workspace
      </InputLabel>
      <Select
        displayEmpty
        labelId="Workspaces"
        id="Workspaces"
        value={selectedProjectUrl}
        onChange={e => handleWorkspaceChange(e)}
        className={classes.select}
      >
        {Object.keys(harnessWorkspaceUrlObject).length > 0 ? (
          <ListSubheader>Workspaces</ListSubheader>
        ) : null}
        {Object.keys(harnessWorkspaceUrlObject).map(workspace => (
          <MenuItem value={workspace} key={workspace}>
            <span className={classes.menuItem}>{workspace}</span>
          </MenuItem>
        ))}
      </Select>
      <FormHelperText />
    </FormControl>
  );
  const DropDownComponent = (
    <Grid container spacing={3} marginBottom={4} marginLeft={1} paddingTop={2}>
      {isWorkspaceAnnotationPresent ? (
        <Grid item md={3}>
          {newWorkspaceDropdown}
        </Grid>
      ) : null}
    </Grid>
  );

  if (state === AsyncStatus.Unauthorized) {
    const urls = Object.values(harnessWorkspaceUrlObject).map(url =>
      url.replace('|', ''),
    );
    return (
      <EmptyState
        title="You don't have the permission to View the following IaCM workspace(s)"
        missing="info"
        action={
          <ul className={classes.workspaceList}>
            {urls.map(workspace => (
              <li
                value={workspace}
                key={workspace}
                className={classes.workspaceItem}
              >
                <span>{workspace}</span>
              </li>
            ))}
          </ul>
        }
      />
    );
  }

  if (state === AsyncStatus.Init || state === AsyncStatus.Loading) {
    return (
      <div className={classes.empty}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <>
      <div className={classes.container}>
        {DropDownComponent}
        <Tabs
          value={selectedTab}
          indicatorColor="primary"
          textColor="primary"
          onChange={handleChange}
          aria-label="workspace_list_tabs"
        >
          <Tab label={`Resources (${resources?.length})`} />
          <Tab label={`Data Sources (${dataSources?.length})`} />
          <Tab label={`Outputs (${outputs?.length})`} />
        </Tabs>
        <WorkspaceTable
          setRefresh={setRefresh}
          refresh={refresh}
          pageSize={pageSize}
          currTableData={currTableData}
          page={page}
          handleChangePage={handleChangePage}
          totalElements={totalElements}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          classes={classes}
          baseUrl={urlForWorkspace}
          workspaceDataType={selectedTab}
          onRowClick={handleRowClick}
          status={state}
        />
      </div>
      <ResourceDetailDrawer
        open={!!selectedRowData} //open drawer if there is selected row data
        resource={selectedRowData}
        onClose={handleDrawerClose}
        title={drawerTitle}
      />
    </>
  );
}
export default WorkspaceList;
