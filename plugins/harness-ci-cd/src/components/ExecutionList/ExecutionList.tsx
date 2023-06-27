import React, { useEffect, useState } from 'react';
import {
  CircularProgress,
  FormControl,
  makeStyles,
  MenuItem,
} from '@material-ui/core';
import { Grid } from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormHelperText from '@mui/material/FormHelperText';
import {
  EmptyState,
  Select as SelectComponent,
  SelectedItems,
} from '@backstage/core-components';
import {
  configApiRef,
  discoveryApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import Swal from 'sweetalert2';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import { useProjectSlugFromEntity } from './useProjectSlugEntity';
import { useEntity } from '@backstage/plugin-catalog-react';
import ExecutionTable from './ExecutionTable';
import { AsyncStatus, TableData } from '../types';

const useStyles = makeStyles(theme => ({
  container: {
    width: '100%',
  },
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));

function ExecutionList() {
  const [refresh, setRefresh] = useState(false);
  const [currTableData, setCurrTableData] = useState<any[]>([]);
  const [state, setState] = useState<AsyncStatus>(AsyncStatus.Init);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [flag, setFlag] = useState(false);
  const [totalElements, setTotalElements] = useState(50);
  const [licenses, setLicenses] = useState('cd');
  const classes = useStyles();
  const discoveryApi = useApi(discoveryApiRef);
  const config = useApi(configApiRef);
  const backendBaseUrl = discoveryApi.getBaseUrl('proxy');

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
  } = useProjectSlugFromEntity(env);

  const allProjects = projectIds?.split(',').map(item => item.trim());
  const [currProject, setCurrProject] = useState(allProjects?.[0]);

  useEffect(() => {
    setRefresh(!refresh);
    setCurrProject(allProjects?.[0]);
    getLicense();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [env]);

  function getSecureHarnessKey(key: string): string | undefined {
    try {
      const token = JSON.parse(
        decodeURI(atob(localStorage.getItem(key) || '')),
      );
      return token ? `Bearer ${token}` : '';
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('Failed to read Harness tokens', err);
      return undefined;
    }
  }

  async function fetchLicenseWithAuth(): Promise<Response> {
    const token = getSecureHarnessKey('token');
    const value = token ? `${token}` : '';

    const headers = new Headers({
      Authorization: value,
    });
    const response = await fetch(
      `${await backendBaseUrl}/harness/${env}/gateway/ng/api/licenses/account?routingId=${accountId}&accountIdentifier=${accountId}`,
      {
        headers,
      },
    );

    return response;
  }

  async function getLicense() {
    const response = await fetchLicenseWithAuth();

    if (response.status === 200) {
      const data = await response.json();
      if (data?.data?.allModuleLicenses?.CD?.length === 0) {
        setLicenses('ci');
      }
    }
  }

  useAsyncRetry(async () => {
    const query = new URLSearchParams({
      accountIdentifier: `${accountId}`,
      routingId: `${accountId}`,
      orgIdentifier: `${orgId}`,
      projectIdentifier: `${currProject}`,
      size: `${pageSize}`,
      page: `${page}`,
    });
    const pipelineList = pipelineId?.split(',').map(item => item.trim()) ?? [];
    if (pipelineList.length > 0) {
      pipelineList.map(pipe => {
        query.append('pipelineIdentifier', pipe);
      });
    }

    const token = getSecureHarnessKey('token');
    const value = token ? `${token}` : '';

    const headers = new Headers({
      'content-type': 'application/json',
      Authorization: value,
    });
    let body;
    if (serviceId) {
      body = JSON.stringify({
        filterType: 'PipelineExecution',
        moduleProperties: {
          cd: {
            serviceIdentifiers: [
              serviceId?.split(',').map(item => item.trim())[0],
            ],
          },
        },
      });
    }
    const response = await fetch(
      `${await backendBaseUrl}/harness/${env}/gateway/pipeline/api/pipelines/execution/v2/summary?${query}`,
      {
        headers,
        method: 'POST',
        body: body,
      },
    );
    if (state === AsyncStatus.Init || state === AsyncStatus.Loading) {
      if (response.status === 200) setState(AsyncStatus.Success);
      else if (response.status === 401) setState(AsyncStatus.Unauthorized);
      else setState(AsyncStatus.Error);
    }
    const data = await response.json();
    const tableData = data.data.content;
    if (data.data.totalElements < 50) {
      setTotalElements(data.data.totalElements);
    }
    const getBuilds = (currentPageSize: number): Array<{}> => {
      const data1: Array<TableData> = [];
      let request = 'pullRequest';
      while (
        data1.length < currentPageSize &&
        tableData &&
        data1.length < data.data.numberOfElements
      ) {
        let serviceString = '';
        let envString = '';

        if (
          typeof tableData[data1.length]?.moduleInfo?.ci?.ciExecutionInfoDTO
            ?.pullRequest === 'undefined'
        ) {
          request = 'branch';
        } else {
          request = 'pullRequest';
        }
        if (tableData[data1.length]?.modules?.includes('cd')) {
          const serviceNames = new Set();
          const envNames = new Set();
          const mapdata = tableData[data1.length]?.layoutNodeMap;

          Object.keys(mapdata).forEach(key => {
            if (mapdata[key].nodeType === 'Deployment') {
              if (mapdata[key]?.moduleInfo?.cd?.infraExecutionSummary?.name)
                envNames.add(
                  mapdata[key]?.moduleInfo?.cd?.infraExecutionSummary?.name,
                );
              if (mapdata[key]?.moduleInfo?.cd?.serviceInfo?.displayName)
                serviceNames.add(
                  mapdata[key]?.moduleInfo?.cd?.serviceInfo?.displayName,
                );
            }
          });
          envString = Array.from(envNames).join(',');
          serviceString = Array.from(serviceNames).join(',');
        }
        data1.push({
          id: `${page * currentPageSize + data1.length + 1}`,
          name: `${tableData[data1.length]?.name}`,
          status: `${tableData[data1.length]?.status}`,
          startTime: `${tableData[data1.length]?.startTs}`,
          endTime: `${tableData[data1.length]?.endTs}`,
          pipelineId: `${tableData[data1.length]?.pipelineIdentifier}`,
          planExecutionId: `${tableData[data1.length]?.planExecutionId}`,
          runSequence: `${tableData[data1.length]?.runSequence}`,
          commitId: `${
            tableData[data1.length]?.moduleInfo?.ci?.ciExecutionInfoDTO?.[
              request
            ]?.commits?.['0']?.id
          }`,
          commitlink: `${
            tableData[data1.length]?.moduleInfo?.ci?.ciExecutionInfoDTO?.[
              request
            ]?.commits?.['0']?.link
          }`,
          branch: `${tableData[data1.length]?.moduleInfo?.ci?.branch}`,
          message: `${
            tableData[data1.length]?.moduleInfo?.ci?.ciExecutionInfoDTO?.[
              request
            ]?.commits?.['0']?.message
          }`,
          prmessage: `${
            tableData[data1.length]?.moduleInfo?.ci?.ciExecutionInfoDTO
              ?.pullRequest?.title
          }`,
          prlink: `${
            tableData[data1.length]?.moduleInfo?.ci?.ciExecutionInfoDTO
              ?.pullRequest?.link
          }`,
          sourcebranch: `${
            tableData[data1.length]?.moduleInfo?.ci?.ciExecutionInfoDTO
              ?.pullRequest?.sourceBranch
          }`,
          targetbranch: `${
            tableData[data1.length]?.moduleInfo?.ci?.ciExecutionInfoDTO
              ?.pullRequest?.targetBranch
          }`,
          prId: `${
            tableData[data1.length]?.moduleInfo?.ci?.ciExecutionInfoDTO
              ?.pullRequest?.id
          }`,
          cdenv: `${envString}`,
          cdser: `${serviceString}`,
          reponame: `${tableData[data1.length]?.moduleInfo?.ci?.repoName}`,
          tag: `${tableData[data1.length]?.moduleInfo?.ci?.tag}`,
        });
      }
      return data1;
    };

    setCurrTableData(getBuilds(pageSize));
    setFlag(true);
  }, [refresh, page, pageSize]);

  async function runPipeline(
    row: TableData,
    // eslint-disable-next-line @typescript-eslint/no-shadow
    backendBaseUrl: Object,
    query1: string,
    // eslint-disable-next-line @typescript-eslint/no-shadow
    setRefresh: React.Dispatch<React.SetStateAction<boolean>>,
    // eslint-disable-next-line @typescript-eslint/no-shadow
    refresh: boolean,
  ): Promise<void> {
    const token = getSecureHarnessKey('token');
    const value = token ? `${token}` : '';

    const headers = new Headers({
      Authorization: value,
    });
    const response = await fetch(
      `${await backendBaseUrl}/harness/${env}/gateway/pipeline/api/pipelines/execution/${
        row.planExecutionId
      }/inputset?${query1}`,
      {
        headers,
      },
    );

    const data = await response.text();

    const resp2 = await fetch(
      `${await backendBaseUrl}/harness/${env}/gateway/pipeline/api/pipeline/execute/rerun/${
        row.planExecutionId
      }/${row.pipelineId}?${query1}&moduleType=ci`,
      {
        headers: {
          'content-type': 'application/yaml',
          Authorization: value,
        },
        body: `${data}`,
        method: 'POST',
      },
    );
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
    setState(AsyncStatus.Loading);
    setFlag(false);
  };

  const handleChangeRowsPerPage = (currentPageSize: number) => {
    setPage(0);
    setPageSize(currentPageSize);
  };

  const handleChange = (event: SelectedItems) => {
    setEnv(event as string);
    setState(AsyncStatus.Loading);
  };

  const handleChangeProject = (event: SelectedItems) => {
    setCurrProject(event as string);
    setRefresh(!refresh);
    setState(AsyncStatus.Loading);
  };

  let dropdown;
  if (envIds.length > 1) {
    dropdown = (
      <SelectComponent
        selected={env}
        onChange={handleChange}
        placeholder="Select Environment"
        label="Environment"
        items={envIds.map(envId => ({ value: envId, label: envId }))}
      />
    );
  }

  let projectDropdown;
  if (allProjects && allProjects?.length > 1) {
    projectDropdown = (
      <SelectComponent
        selected={currProject}
        onChange={handleChangeProject}
        placeholder="Select Project"
        label="Project"
        items={allProjects.map(proj => ({ value: proj, label: proj }))}
      />
    );
  }

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
        <Grid container spacing={3} marginBottom={2}>
          {envIds.length > 1 && (
            <Grid item md={3}>
              {dropdown}
            </Grid>
          )}
          {allProjects && allProjects?.length > 1 && (
            <Grid item md={3}>
              {projectDropdown}
            </Grid>
          )}
        </Grid>
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
        <Grid container spacing={3} marginBottom={4}>
          {envIds.length > 1 && (
            <Grid item md={3}>
              {dropdown}
            </Grid>
          )}
          {allProjects && allProjects?.length > 1 && (
            <Grid item md={3}>
              {projectDropdown}
            </Grid>
          )}
        </Grid>
        <ExecutionTable
          baseUrl1={baseUrl1}
          accountId={accountId}
          licenses={licenses}
          orgId={orgId}
          currProject={currProject}
          boolDisableRunPipeline={boolDisableRunPipeline}
          backendBaseUrl={backendBaseUrl}
          setRefresh={setRefresh}
          refresh={refresh}
          pageSize={pageSize}
          currTableData={currTableData}
          setState={setState}
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
