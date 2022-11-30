import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  Link,
  makeStyles,
  Typography,
} from '@material-ui/core';
import { EmptyState, Table, TableColumn } from '@backstage/core-components';
import RetryIcon from '@material-ui/icons/Replay';
// import { Link as RouterLink } from 'react-router-dom';
// import { harnessCIBuildRouteRef } from '../../route-refs';
import {
  configApiRef,
  discoveryApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import { durationHumanized, relativeTimeTo } from '../../util';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import { useProjectSlugFromEntity } from '../../hooks/useProjectSlugEntity';
import Swal from 'sweetalert2';
import { AlertDialog } from './RunPipeline';
import { getStatusComponent, stringsMap } from './stringsMaps';
import { PrintCard } from './Details';

enum AsyncStatus {
  Init,
  Loading,
  Success,
  Error,
  Unauthorized,
}

export interface TableData {
  id: string;
  name: string;
  status: string;
  startTime: string;
  endTime: string;
  pipelineId: string;
  planExecutionId: string;
  runSequence: string;
  commitId: string;
  commitlink: string;
  branch: string;
  message: string;
  sourcebranch: string;
  targetbranch: string;
  prmessage: string;
  prlink: string;
  prId: string;
  cdenv?: string;
  cdser?: string;
  reponame: string;
  tag: string;
}

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
  const [tableData, setTableData] = useState<any[]>([]);
  const [state, setState] = useState<AsyncStatus>(AsyncStatus.Init);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [pipelineList, setpipelineList] = useState<any[]>([]);
  const [toggle, setToggle] = useState(false);
  const [serviceToast, setServiceToast] = useState(false);
  const [flag, setFlag] = useState(false);
  const [renderedOnce, setRenderedOnce] = useState(true);
  const [totalElements, setTotalElements] = useState(50);
  const [licenses, setLicenses] = useState('cd');
  const classes = useStyles();
  const discoveryApi = useApi(discoveryApiRef);
  const config = useApi(configApiRef);
  const backendBaseUrl = discoveryApi.getBaseUrl('proxy');
  const baseUrl =
    config.getOptionalString('harness.baseUrl') ?? 'https://app.harness.io/';
  const boolDisableRunPipeline =
    config.getOptionalBoolean('harness.disableRunPipeline') ?? false;

  const { projectId, orgId, accountId, pipelineId, serviceId, urlParams } =
    useProjectSlugFromEntity();
  async function getLicense() {
    const response = await fetch(
      `${await backendBaseUrl}/harness/gateway/ng/api/licenses/account?routingId=${accountId}&accountIdentifier=${accountId}`,
    );
    if (response.status == 200) {
      const data = await response.json();
      if (data?.data?.allModuleLicenses?.CD?.length == 0) {
        setLicenses('ci');
      }
    }
  }
  useEffect(() => {
    getLicense();
  }, []);

  async function getPipeLineByService() {
    const list = serviceId;
    let service1 = list?.split(',').map(item => item.trim()) || '';
    const resp = await fetch(
      `${await backendBaseUrl}/harness/gateway/ng/api/dashboard/getServiceHeaderInfo?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${orgId}&projectIdentifier=${projectId}&serviceId=${
        service1[0]
      }`,
    );
    if (resp.status != 200) {
      setToggle(true);
      setServiceToast(true);
    }
    const jsondata = await resp.json();
    let serviceName = jsondata?.data?.name;
    const response = await fetch(
      `${await backendBaseUrl}/harness/gateway/pipeline/api/pipelines/list?routingId=${accountId}&accountIdentifier=${accountId}&projectIdentifier=${projectId}&orgIdentifier=${orgId}&page=0&sort=lastUpdatedAt%2CDESC&size=5`,
      {
        headers: {
          'content-type': 'application/json',
        },
        body: `{\"filterType\":\"PipelineSetup\",\"moduleProperties\":{\"cd\":{\"serviceNames\":[\"${serviceName}\"]}}}`,
        method: 'POST',
      },
    );
    const data = await response.json();
    const filteredData = await data?.data?.content.filter((obj: any) => {
      return obj.recentExecutionsInfo.length > 0;
    });
    filteredData?.map((pipe: any) => {
      setpipelineList(data => [...data, pipe.identifier]);
    });
  }
  async function getPipelinefromCatalog() {
    const list = pipelineId;
    let elements = list?.split(',').map(item => item.trim());
    let count = 0;
    elements?.map(pipe => {
      if (count < 10) setpipelineList(data => [...data, pipe]);
      count++;
    });
  }
  async function getAllPipelines() {
    if (!toggle) {
      if (pipelineId) await getPipelinefromCatalog();
      if (serviceId) await getPipeLineByService();
    }
    setToggle(true);
  }
  useAsyncRetry(async () => {
    await getAllPipelines();
  }, []);

  const columns: TableColumn[] = [
    {
      title: 'NO',
      field: 'id',
      type: 'numeric',
      width: '5%',
      align: 'left',
      cellStyle: {
        paddingLeft: '30px',
      },
      render: (row: Partial<TableData>) => {
        const link =
          `${baseUrl}ng/#/account/` +
          accountId +
          '/' +
          licenses +
          '/orgs/' +
          orgId +
          '/projects/' +
          projectId +
          '/pipelines/' +
          row.pipelineId +
          '/deployments/' +
          row.planExecutionId +
          '/pipeline';
        const id = parseInt(row.id ? row.id : '0');
        return (
          <Link href={link} target="_blank">
            <b>{id}</b>
          </Link>
        );
      },
    },
    {
      title: 'Pipeline Name',
      field: 'col1',
      width: '22%',
      render: (row: Partial<TableData>) => {
        const link =
          `${baseUrl}ng/#/account/` +
          accountId +
          '/' +
          licenses +
          '/orgs/' +
          orgId +
          '/projects/' +
          projectId +
          '/pipelines/' +
          row.pipelineId +
          '/deployments/' +
          row.planExecutionId +
          '/pipeline';
        return (
          <Typography style={{ fontSize: 'small', color: 'grey' }}>
            <Link href={link} target="_blank" style={{ fontSize: '0.9rem' }}>
              <b>{row.name} </b>
            </Link>
            <br />
            Build ID: {row?.runSequence}
          </Typography>
        );
      },

      customFilterAndSearch: (term, row: Partial<TableData>) => {
        const temp = row?.name + ' ' + row?.runSequence ?? '';
        return temp.toLowerCase().indexOf(term.toLowerCase()) > -1;
      },
      customSort: (row1: Partial<TableData>, row2: Partial<TableData>) => {
        const a = row1.name ?? '';
        const b = row2.name ?? '';
        return a > b ? 1 : -1;
      },
    },
    {
      title: 'Pipeline Status',
      field: 'col2',
      width: '18%',
      render: useCallback(
        (row: Partial<TableData>) => (
          <Box display="flex" alignItems="center">
            {getStatusComponent(stringsMap[row?.status ?? 'Failed'])}
            <Box mr={1} />
            <Typography variant="button">
              {stringsMap[row?.status ?? 'Failed']}
            </Typography>
          </Box>
        ),
        [],
      ),
      customFilterAndSearch: (term, row: Partial<TableData>) => {
        const temp = row?.status ?? '';
        return temp.toLowerCase().indexOf(term.toLowerCase()) > -1;
      },
      customSort: (row1: Partial<TableData>, row2: Partial<TableData>) => {
        const a = row1.status ?? '';
        const b = row2.status ?? '';
        return a > b ? 1 : -1;
      },
    },
    {
      title: 'Details',
      field: 'col3',
      width: '30%',
      sorting: false,
      render: useCallback(
        (row: Partial<TableData>) => <PrintCard props={row} />,
        [],
      ),
    },
    {
      title: 'Pipeline time',
      field: 'col4',
      type: 'date',
      width: '20%',
      render: useCallback((row: Partial<TableData>) => {
        if (
          durationHumanized(
            new Date(Number(row.startTime)),
            new Date(Number(row.endTime)),
          ) == 'NaN years'
        ) {
          return (
            <>
              <Typography style={{ fontSize: '0.9rem' }}>
                {new Date(Number(row.startTime)).toUTCString()}
              </Typography>
              <Typography variant="body2">
                run {relativeTimeTo(new Date(Number(row.startTime)))}
              </Typography>
            </>
          );
        } else {
          return (
            <>
              <Typography style={{ fontSize: '0.9rem' }}>
                {new Date(Number(row.startTime)).toUTCString()}
              </Typography>
              <Typography variant="body2">
                run {relativeTimeTo(new Date(Number(row.startTime)))}
              </Typography>
              <Typography variant="body2">
                took{' '}
                {durationHumanized(
                  new Date(Number(row.startTime)),
                  new Date(Number(row.endTime)),
                )}
              </Typography>
            </>
          );
        }
      }, []),
      customSort: (row1: Partial<TableData>, row2: Partial<TableData>) => {
        const a = row1.startTime ?? '';
        const b = row2.startTime ?? '';
        return a > b ? 1 : -1;
      },
      customFilterAndSearch: (term, row: Partial<TableData>) => {
        const temp = new Date(Number(row.startTime)).toUTCString();
        return temp.toLowerCase().indexOf(term.toLowerCase()) > -1;
      },
    },
  ];

  if (!boolDisableRunPipeline) {
    columns.push({
      title: 'Run Pipeline',
      field: 'col5',
      sorting: false,
      width: '5%',
      render: (row: Partial<TableData>) => {
        const query1 = new URLSearchParams({
          accountIdentifier: `${accountId}`,
          routingId: `${accountId}`,
          orgIdentifier: `${orgId}`,
          projectIdentifier: `${projectId}`,
        }).toString();
        return (
          <>
            <AlertDialog
              row={row}
              backendBaseUrl={backendBaseUrl}
              query1={query1}
            />
          </>
        );
      },
    });
  }

  useAsyncRetry(async () => {
    const query = new URLSearchParams({
      accountIdentifier: `${accountId}`,
      routingId: `${accountId}`,
      orgIdentifier: `${orgId}`,
      projectIdentifier: `${projectId}`,
      size: `${pageSize}`,
      page: `${page}`,
    });
    if (pipelineList.length > 0) {
      pipelineList.map(pipe => {
        query.append('pipelineIdentifier', pipe);
      });
    }
    if (toggle) {
      const response = await fetch(
        `${await backendBaseUrl}/harness/gateway/pipeline/api/pipelines/execution/v2/summary?${query}`,
        {
          method: 'POST',
        },
      );
      if (state == AsyncStatus.Init || state == AsyncStatus.Loading) {
        if (response.status == 200) setState(AsyncStatus.Success);
        else if (response.status == 401) setState(AsyncStatus.Unauthorized);
        else setState(AsyncStatus.Error);
      }
      const data = await response.json();
      const tableData = data.data.content;
      if (data.data.totalElements < 50) {
        setTotalElements(data.data.totalElements);
      }
      const generateTestData: (number: number) => Array<{}> = (rows = 10) => {
        const data1: Array<TableData> = [];
        let request = 'pullRequest';
        while (
          data1.length < rows &&
          tableData &&
          data1.length < data.data.numberOfElements
        ) {
          let serviceString = '';
          let envString = '';

          if (
            typeof tableData[data1.length]?.['moduleInfo']?.['ci']?.[
              'ciExecutionInfoDTO'
            ]?.['pullRequest'] === 'undefined'
          ) {
            request = 'branch';
          } else {
            request = 'pullRequest';
          }
          if (tableData[data1.length]?.['modules']?.includes('cd')) {
            const serviceNames = new Set();
            const envNames = new Set();
            const mapdata = tableData[data1.length]?.['layoutNodeMap'];

            Object.keys(mapdata).forEach(key => {
              if (mapdata[key].nodeType == 'Deployment') {
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
            id: `${page * pageSize + data1.length + 1}`,
            name: `${tableData[data1.length]?.['name']}`,
            status: `${tableData[data1.length]?.['status']}`,
            startTime: `${tableData[data1.length]?.['startTs']}`,
            endTime: `${tableData[data1.length]?.['endTs']}`,
            pipelineId: `${tableData[data1.length]?.['pipelineIdentifier']}`,
            planExecutionId: `${tableData[data1.length]?.['planExecutionId']}`,
            runSequence: `${tableData[data1.length]?.['runSequence']}`,
            commitId: `${
              tableData[data1.length]?.['moduleInfo']?.['ci']?.[
                'ciExecutionInfoDTO'
              ]?.[request]?.['commits']?.['0']?.['id']
            }`,
            commitlink: `${
              tableData[data1.length]?.['moduleInfo']?.['ci']?.[
                'ciExecutionInfoDTO'
              ]?.[request]?.['commits']?.['0']?.['link']
            }`,
            branch: `${
              tableData[data1.length]?.['moduleInfo']?.['ci']?.['branch']
            }`,
            message: `${
              tableData[data1.length]?.['moduleInfo']?.['ci']?.[
                'ciExecutionInfoDTO'
              ]?.[request]?.['commits']?.['0']?.['message']
            }`,
            prmessage: `${
              tableData[data1.length]?.['moduleInfo']?.['ci']?.[
                'ciExecutionInfoDTO'
              ]?.['pullRequest']?.['title']
            }`,
            prlink: `${
              tableData[data1.length]?.['moduleInfo']?.['ci']?.[
                'ciExecutionInfoDTO'
              ]?.['pullRequest']?.['link']
            }`,
            sourcebranch: `${
              tableData[data1.length]?.['moduleInfo']?.['ci']?.[
                'ciExecutionInfoDTO'
              ]?.['pullRequest']?.['sourceBranch']
            }`,
            targetbranch: `${
              tableData[data1.length]?.['moduleInfo']?.['ci']?.[
                'ciExecutionInfoDTO'
              ]?.['pullRequest']?.['targetBranch']
            }`,
            prId: `${
              tableData[data1.length]?.['moduleInfo']?.['ci']?.[
                'ciExecutionInfoDTO'
              ]?.['pullRequest']?.['id']
            }`,
            cdenv: `${envString}`,
            cdser: `${serviceString}`,
            reponame: `${
              tableData[data1.length]?.['moduleInfo']?.['ci']?.['repoName']
            }`,
            tag: `${tableData[data1.length]?.['moduleInfo']?.['ci']?.['tag']}`,
          });
        }
        return data1;
      };

      setTableData(generateTestData(pageSize));
      setFlag(true);
    }
  }, [refresh, page, pageSize, toggle]);

  const handleChangePage = (page: number, pageSize: number) => {
    setPage(page);
    setPageSize(pageSize);
    setState(AsyncStatus.Loading);
    setFlag(false);
  };

  const handleChangeRowsPerPage = (pageSize: number) => {
    setPage(0);
    setPageSize(pageSize);
  };

  if (
    state == AsyncStatus.Init ||
    state == AsyncStatus.Loading ||
    (state == AsyncStatus.Success && !flag)
  ) {
    return (
      <div className={classes.empty}>
        <CircularProgress />
      </div>
    );
  }
  if (
    !urlParams ||
    state == AsyncStatus.Error ||
    state == AsyncStatus.Unauthorized ||
    (state == AsyncStatus.Success && tableData.length === 0 && flag)
  ) {
    let description = '';
    if (state == AsyncStatus.Unauthorized)
      description =
        'Could not find the pipeline executions, the x-api-key is either missing or incorrect in app-config.yaml under proxy settings.';
    else if (!urlParams)
      description =
        'Could not find the pipeline executions, please check your project-url configuration in catalog-info.yaml.';
    else if (state == AsyncStatus.Success && tableData.length == 0)
      description = 'No executions found';
    else
      description =
        'Could not find the pipeline executions, please check your configurations in catalog-info.yaml or check your permissions.';
    return (
      <EmptyState
        title="Harness CI-CD pipelines"
        description={description}
        missing="data"
      />
    );
  }

  if (serviceToast && renderedOnce) {
    setRenderedOnce(false);
    const Toast = Swal.mixin({
      toast: true,
      position: 'top',
      showCloseButton: true,
      showConfirmButton: false,
      width: '375px',
      padding: '2px 5px',
    });

    Toast.fire({
      icon: 'warning',
      title: 'Incorrect Service ID',
      text: 'Please check your service ID configuration in catalog-info.yaml',
      showClass: {
        backdrop: 'swal2-noanimation', // disable backdrop animation
        popup: '', // disable popup animation
        icon: '', // disable icon animation
      },
      hideClass: {
        popup: '', // disable popup fade-out animation
      },
    });
  }

  return (
    <>
      <div className={classes.container}>
        <Table
          options={{
            paging: true,
            filtering: false,
            emptyRowsWhenPaging: false,
            pageSize: pageSize,
            pageSizeOptions: [5, 10, 25],
          }}
          data={tableData ?? []}
          columns={columns}
          actions={[
            {
              icon: () => <RetryIcon />,
              tooltip: 'Refresh Data',
              isFreeAction: true,
              onClick: () => {
                setRefresh(!refresh);
                setState(AsyncStatus.Loading);
              },
            },
          ]}
          emptyContent={
            <div className={classes.empty}>
              <CircularProgress />
            </div>
          }
          title="Execution History"
          page={page}
          onPageChange={handleChangePage}
          totalCount={totalElements}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </div>
    </>
  );
}

export default ExecutionList;
