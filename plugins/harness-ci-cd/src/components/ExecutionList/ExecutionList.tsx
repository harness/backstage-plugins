import React, { useEffect, useState } from 'react';
import {
  CircularProgress,
  makeStyles,
  FormControl,
  MenuItem,
} from '@material-ui/core';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import ListSubheader from '@mui/material/ListSubheader';
import { Grid } from '@mui/material';
import { EmptyState } from '@backstage/core-components';
import {
  configApiRef,
  discoveryApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Swal from 'sweetalert2';
import { useProjectSlugFromEntity } from '../../hooks/useProjectSlugEntity';
import { useEntity } from '@backstage/plugin-catalog-react';
import ExecutionTable from './ExecutionTable';
import { AsyncStatus, TableData } from '../types';
import useGetExecutionsList from '../../hooks/useGetExecutionsList';
import useGetLicenseWithAuth from '../../hooks/useGetLicenseWithAuth';
import useMutateRunPipeline from '../../hooks/useMutateRunPipeline';
import usePipelineSlugEntity from '../../hooks/usePipelineSlugEntity';

const useStyles = makeStyles(theme => ({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: '2px',
    fontSize: '14px !important',
  },
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));

function ExecutionList() {
  const [refresh, setRefresh] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const classes = useStyles();
  const discoveryApi = useApi(discoveryApiRef);
  const config = useApi(configApiRef);
  const backendBaseUrl = discoveryApi.getBaseUrl('proxy');
  const {
    isNewAnnotationPresent,
    harnessPipelineObject,
    harnessServicesObject,
  } = usePipelineSlugEntity();
  const [selectedPipelineUrl, setSelectedPipelineUrl] = useState(() => {
    if (Object.keys(harnessServicesObject).length) {
      return harnessServicesObject[Object.keys(harnessServicesObject)[0]];
    }
    return harnessPipelineObject[Object.keys(harnessPipelineObject)[0]];
  });

  const boolDisableRunPipeline =
    config.getOptionalBoolean('harness.disableRunPipeline') ?? false;
  const { entity } = useEntity();

  const allEnvsAnnotations = [
    ['prod', 'harness.io/project-url'],
    ['stage', 'harness.io/project-url-stage'],
    ['qa', 'harness.io/project-url-qa'],
    ['stress', 'harness.io/project-url-stress'],
  ];

  const envIds: string[] = [];
  allEnvsAnnotations.forEach(envAnnotation => {
    if (Boolean(entity.metadata.annotations?.[envAnnotation[1]])) {
      envIds.push(envAnnotation[0]);
    }
  });

  const [env, setEnv] = useState(envIds[0]);

  const {
    orgId,
    accountId,
    pipelineId,
    serviceId,
    urlParams,
    baseUrl1,
    projectIds,
    envFromUrl,
  } = useProjectSlugFromEntity(
    env,
    isNewAnnotationPresent,
    selectedPipelineUrl,
  );

  const allProjects = projectIds?.split(',').map(item => item.trim());
  const [currProject, setCurrProject] = useState(allProjects?.[0]);
  const envToUse = isNewAnnotationPresent && envFromUrl ? envFromUrl : env;
  const projectToUse = isNewAnnotationPresent ? projectIds : currProject;

  useEffect(() => {
    setRefresh(!refresh);
    setCurrProject(allProjects?.[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [env]);

  const {
    status: state,
    currTableData,
    totalElements,
    flag,
  } = useGetExecutionsList({
    accountId,
    orgId,
    currProject: projectToUse,
    pageSize,
    page,
    pipelineId,
    serviceId,
    env: envToUse,
    backendBaseUrl,
    refresh,
  });

  const { licenses } = useGetLicenseWithAuth({
    backendBaseUrl,
    env: envToUse,
    accountId,
  });

  const { runPipeline: executePipeline } = useMutateRunPipeline({
    backendBaseUrl,
    env: envToUse,
  });

  async function runPipeline(
    row: TableData,
    // eslint-disable-next-line @typescript-eslint/no-shadow
    query1: string,
    // eslint-disable-next-line @typescript-eslint/no-shadow
    setRefresh: React.Dispatch<React.SetStateAction<boolean>>,
    // eslint-disable-next-line @typescript-eslint/no-shadow
    refresh: boolean,
  ): Promise<void> {
    const resp2 = await executePipeline(row, query1);

    if (resp2.status === 200) {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });

      Toast.fire({
        icon: 'success',
        title: 'Pipeline ran successfully',
      });
    } else if (resp2.status === 403) {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top',
        showCloseButton: true,
        showConfirmButton: false,
        width: '500px',
      });

      Toast.fire({
        icon: 'warning',
        title: "You don't have access to trigger this pipeline",
        text: 'Please check your API key configuration',
      });
    } else {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top',
        showCloseButton: true,
        showConfirmButton: false,
      });

      Toast.fire({
        icon: 'error',
        title: 'Pipeline Trigger Failed',
      });
    }
    setRefresh(!refresh);
  }

  const handleChangePage = (currentPage: number, currentPageSize: number) => {
    setPage(currentPage);
    setPageSize(currentPageSize);
  };

  const handleChangeRowsPerPage = (currentPageSize: number) => {
    setPage(0);
    setPageSize(currentPageSize);
  };

  const handleChange = async (event: SelectChangeEvent) => {
    setEnv(event.target.value as string);
  };

  const handleChangeProject = async (event: SelectChangeEvent) => {
    setCurrProject(event.target.value as string);
    setRefresh(!refresh);
  };

  const EnvDropDown =
    envIds.length > 1 ? (
      <FormControl fullWidth>
        <InputLabel
          htmlFor="Environment"
          classes={{
            root: classes.label,
          }}
        >
          Environment
        </InputLabel>
        <Select
          labelId="Environment"
          id="Environment"
          value={env}
          onChange={handleChange}
        >
          {envIds.map(envId => (
            <MenuItem value={envId}>{envId}</MenuItem>
          ))}
        </Select>
        <FormHelperText />
      </FormControl>
    ) : null;

  const ProjectDropDown =
    allProjects && allProjects?.length > 1 ? (
      <FormControl fullWidth>
        <InputLabel
          htmlFor="Project"
          classes={{
            root: classes.label,
          }}
        >
          Project
        </InputLabel>
        <Select
          labelId="Project"
          id="Project"
          value={currProject}
          onChange={handleChangeProject}
        >
          {allProjects.map(proj => (
            <MenuItem value={proj}>{proj}</MenuItem>
          ))}
        </Select>
        <FormHelperText />
      </FormControl>
    ) : null;

  const handleUrlChange = async (event: SelectChangeEvent) => {
    setSelectedPipelineUrl(event.target.value as string);
    setRefresh(!refresh);
  };

  const NewUrlDropDown = (
    <FormControl fullWidth>
      <InputLabel
        htmlFor="Service/Pipeline"
        classes={{
          root: classes.label,
        }}
      >
        Service / Pipeline
      </InputLabel>
      <Select
        displayEmpty
        labelId="Service/Pipeline"
        id="Service/Pipeline"
        value={selectedPipelineUrl}
        onChange={handleUrlChange}
      >
        {Object.keys(harnessServicesObject).length ? (
          <ListSubheader>Services</ListSubheader>
        ) : null}
        {Object.keys(harnessServicesObject).map(envId => (
          <MenuItem value={harnessServicesObject[envId]}>{envId}</MenuItem>
        ))}
        {Object.keys(harnessPipelineObject).length > 0 ? (
          <ListSubheader>Pipelines</ListSubheader>
        ) : null}
        {Object.keys(harnessPipelineObject).map(envId => (
          <MenuItem value={harnessPipelineObject[envId]}>{envId}</MenuItem>
        ))}
      </Select>
      <FormHelperText />
    </FormControl>
  );

  const DropDownComponent = (
    <Grid container spacing={3} marginBottom={4}>
      {envIds.length > 1 && !isNewAnnotationPresent ? (
        <Grid item md={3}>
          {EnvDropDown}
        </Grid>
      ) : null}
      {allProjects && allProjects?.length > 1 && !isNewAnnotationPresent ? (
        <Grid item md={3}>
          {ProjectDropDown}
        </Grid>
      ) : null}
      {isNewAnnotationPresent ? (
        <Grid item md={3}>
          {NewUrlDropDown}
        </Grid>
      ) : null}
    </Grid>
  );

  if (
    state === AsyncStatus.Init ||
    state === AsyncStatus.Loading ||
    (state === AsyncStatus.Success && !flag)
  ) {
    return (
      <div className={classes.empty}>
        <CircularProgress />
      </div>
    );
  }

  if (
    !urlParams ||
    state === AsyncStatus.Error ||
    state === AsyncStatus.Unauthorized ||
    (state === AsyncStatus.Success && currTableData.length === 0 && flag)
  ) {
    let description = '';
    if (state === AsyncStatus.Unauthorized)
      description =
        'Could not find the pipeline executions, the x-api-key is either missing or incorrect in app-config.yaml under proxy settings.';
    else if (!urlParams)
      description =
        'Could not find the pipeline executions, please check your project-url configuration in catalog-info.yaml.';
    else if (state === AsyncStatus.Success && currTableData.length === 0)
      description = 'No executions found';
    else
      description =
        'Could not find the pipeline executions, please check your configurations in catalog-info.yaml or check your permissions.';
    return (
      <>
        {DropDownComponent}
        <EmptyState
          title="Harness CI-CD pipelines"
          description={description}
          missing="data"
        />
      </>
    );
  }

  return (
    <>
      <div className={classes.container}>
        {DropDownComponent}
        <ExecutionTable
          baseUrl1={baseUrl1}
          accountId={accountId}
          licenses={licenses}
          orgId={orgId}
          currProject={projectToUse}
          boolDisableRunPipeline={boolDisableRunPipeline}
          backendBaseUrl={backendBaseUrl}
          setRefresh={setRefresh}
          refresh={refresh}
          pageSize={pageSize}
          currTableData={currTableData}
          page={page}
          handleChangePage={handleChangePage}
          totalElements={totalElements}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          classes={classes}
          runPipeline={runPipeline}
        />
      </div>
    </>
  );
}

export default ExecutionList;
