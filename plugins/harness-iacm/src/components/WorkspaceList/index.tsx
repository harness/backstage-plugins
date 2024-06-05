/* eslint-disable @backstage/no-undeclared-imports */
import React, { useState } from 'react';
import {
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  ListSubheader,
  makeStyles,
  MenuItem,
  Select,
} from '@material-ui/core';
// eslint-disable-next-line no-restricted-imports
import { Grid } from '@mui/material';
import { discoveryApiRef, useApi } from '@backstage/core-plugin-api';
import { AsyncStatus } from '../../types';
import useGetResources from '../../hooks/useGetResources';
import useProjectUrlSlugEntity from '../../hooks/useProjectUrlEntity';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useResourceSlugFromEntity } from './useResourceSlugFromEntity';
import ResourceTable from '../ResourceTable';

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
}));

export interface Workspace {
  identifier: string;
  name: string;
}

function WorkspaceList() {
  const [refresh, setRefresh] = useState(false);

  const classes = useStyles();
  const discoveryApi = useApi(discoveryApiRef);
  const backendBaseUrl = discoveryApi.getBaseUrl('proxy');

  const { isWorkspaceAnnotationPresent, harnessWorkspaceUrlObject } =
    useProjectUrlSlugEntity();

  const allEnvsAnnotations = [
    ['prod', 'harness.io/project-url'],
    ['qa', 'harness.io/project-url-qa'],
  ];

  const { entity } = useEntity();

  const envIds: string[] = [];
  allEnvsAnnotations.forEach(envAnnotation => {
    if (Boolean(entity.metadata.annotations?.[envAnnotation[1]])) {
      envIds.push(envAnnotation[0]);
    }
  });
  const [selectedProjectUrl, setSelectedProjectUrl] = useState(() => {
    return Object.keys(harnessWorkspaceUrlObject)[0];
  });

  const [selectedResourceUrl, setSelectedResourceUrl] = useState(() => {
    return harnessWorkspaceUrlObject[Object.keys(harnessWorkspaceUrlObject)[0]];
  });

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

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

  const { resources, status: state } = useGetResources({
    backendBaseUrl,
    accountId,
    orgId,
    projectId,
    refresh,
    envFromUrl,
    workspace: workspaceId || null,
  });

  const handleWorkspaceChange = (event: any) => {
    setSelectedProjectUrl(event.target.value as string);

    setSelectedResourceUrl(harnessWorkspaceUrlObject[event.target.value]);
  };

  const handleChangePage = (currentPage: number, currentPageSize: number) => {
    setPage(currentPage);
    setPageSize(currentPageSize);
  };

  const handleChangeRowsPerPage = (currentPageSize: number) => {
    setPage(0);
    setPageSize(currentPageSize);
  };

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
          <MenuItem value={workspace}>
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
        <ResourceTable
          accountId={accountId}
          orgId={orgId}
          backendBaseUrl={backendBaseUrl}
          setRefresh={setRefresh}
          refresh={refresh}
          pageSize={pageSize}
          currTableData={resources?.resources}
          page={page}
          handleChangePage={handleChangePage}
          totalElements={resources?.resources?.length}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          classes={classes}
          baseUrl={urlForWorkspace}
        />
      </div>
    </>
  );
}
export default WorkspaceList;
