import React, { useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Link,
  makeStyles,
  MenuItem,
  Typography,
} from '@material-ui/core';
import { EmptyState, Table, TableColumn } from '@backstage/core-components';
import RetryIcon from '@material-ui/icons/Replay';
import {
  discoveryApiRef,
  useApi,
  configApiRef,
} from '@backstage/core-plugin-api';
import { useProjectSlugFromEntity } from './useProjectSlugEntity';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormHelperText from '@mui/material/FormHelperText';
import dayjs from 'dayjs';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';

enum AsyncStatus {
  Init,
  Loading,
  Success,
  Error,
  Unauthorized,
}

interface TableData {
  name: string;
  archived: string;
  owner: string;
  createdAt?: string;
  modifiedAt?: any;
  kind?: string;
  identifier: string;
  status: string;
  state: string;
  pipelineConfigured: string;
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
/// /

function FeatureList() {
  const [refresh, setRefresh] = useState(false);
  const [currTableData, setCurrTableData] = useState<any[]>([]);
  const [state, setState] = useState<AsyncStatus>(AsyncStatus.Init);
  const [envIds, setEnvIds] = useState<string[]>([]);
  const [envId, setEnvId] = React.useState('');
  const [totalElements, setTotalElements] = useState(50);
  const [done, setDone] = useState<boolean>(false);
  const [flag, setFlag] = useState(false);

  const classes = useStyles();
  const discoveryApi = useApi(discoveryApiRef);
  const backendBaseUrl = discoveryApi.getBaseUrl('proxy');
  const config = useApi(configApiRef);
  const baseUrl =
    config.getOptionalString('harness.baseUrl') ?? 'https://app.harness.io/';

  const { projectId, orgId, accountId, urlParams } = useProjectSlugFromEntity();

  async function getFeatureEnv() {
    const resp = await fetch(
      `${await backendBaseUrl}/harness/gateway/ng/api/environments?accountId=${accountId}&routingId=${accountId}&orgIdentifier=${orgId}&projectIdentifier=${projectId}`,
    );
    if (state === AsyncStatus.Init || state === AsyncStatus.Loading) {
      if (resp.status === 200) setState(AsyncStatus.Success);
      else if (resp.status === 401) setState(AsyncStatus.Unauthorized);
      else setState(AsyncStatus.Error);
    }
    const data = await resp.json();
    data?.data?.content.map((obj: any) => {
      setEnvIds(env => [...env, obj.identifier]);
    });
    setDone(true);
    setRefresh(!refresh);
  }
  useEffect(() => {
    getFeatureEnv();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: TableColumn[] = [
    {
      title: 'State',
      field: 'col1',
      width: '10%',
      render: (row: Partial<TableData>) => {
        return (
          <Typography style={{ fontSize: 'medium', color: 'brown' }}>
            <b>{row.state} </b>
          </Typography>
        );
      },
    },
    {
      title: 'Feature Name',
      field: 'col1',
      width: '30%',
      render: (row: Partial<TableData>) => {
        const link = `${baseUrl}ng/#/account/${accountId}/cf/orgs/${orgId}/projects/${projectId}/feature-flags/${row.identifier}?tab=activity&activeEnvironment=${envId}`;
        return (
          <Link href={link} target="_blank">
            <b>{row.name}</b>
          </Link>
        );
      },
      customFilterAndSearch: (term, row: Partial<TableData>) => {
        const temp = row?.name ?? '';
        return temp.toLowerCase().indexOf(term.toLowerCase()) > -1;
      },
      customSort: (row1: Partial<TableData>, row2: Partial<TableData>) => {
        const a = row1.name ?? '';
        const b = row2.name ?? '';
        return a > b ? 1 : -1;
      },
    },
    {
      title: 'Created By',
      field: 'col2',
      width: '30%',
      sorting: false,
      render: (row: Partial<TableData>) => {
        return (
          <Typography style={{ fontSize: 'small', color: 'grey' }}>
            <b>{row.owner} </b>
          </Typography>
        );
      },
    },
    {
      title: 'Type',
      field: 'col3',
      width: '18%',
      type: 'string',
      render: (row: Partial<TableData>) => {
        return (
          <Typography style={{ fontSize: 'small', color: 'black' }}>
            <b>{row.kind} </b>
          </Typography>
        );
      },
    },
    {
      title: 'Status',
      field: 'col4',
      type: 'string',
      render: (row: Partial<TableData>) => {
        return (
          <Typography style={{ fontSize: 'small', color: 'green' }}>
            <b>{row.status} </b>
          </Typography>
        );
      },
    },
    {
      title: 'Pipeline Configured',
      field: 'col5',
      type: 'string',
      render: (row: Partial<TableData>) => {
        return (
          <Typography style={{ fontSize: 'small', color: 'green' }}>
            <b>{row.pipelineConfigured} </b>
          </Typography>
        );
      },
    },
    {
      title: 'Created at',
      field: 'col6',
      type: 'date',
      render: (row: Partial<TableData>) => {
        const time = dayjs(row.createdAt).format('DD MMM HH:mm A');
        return <Typography>{time}</Typography>;
      },
    },

    {
      title: 'Modified At',
      field: 'col7',
      type: 'date',
      render: (row: Partial<TableData>) => {
        const time = dayjs(row.modifiedAt).format('DD MMM HH:mm A');
        return <Typography>{time}</Typography>;
      },
    },
  ];
  useAsyncRetry(async () => {
    const query = new URLSearchParams({
      routingId: `${accountId}`,
      projectIdentifier: `${projectId}`,
      environmentIdentifier: `${envId}`,
      accountIdentifier: `${accountId}`,
      orgIdentifier: `${orgId}`,
    });
    if (done) {
      if (!envId) {
        setEnvId(envIds[0]);
      } else {
        // eslint-disable-next-line no-inner-declarations
        async function fetchFeatures() {
          const resp2 = await fetch(
            `${await backendBaseUrl}/harness/gateway/cf/admin/features?${query}&metrics=true&flagCounts=true&name=&summary=true`,
          );
          if (state === AsyncStatus.Init || state === AsyncStatus.Loading) {
            if (resp2.status === 200) setState(AsyncStatus.Success);
            else if (resp2.status === 401) setState(AsyncStatus.Unauthorized);
            else setState(AsyncStatus.Error);
          }
          const data = await resp2.json();
          if (data.itemCount < 50) {
            setTotalElements(data.itemCount);
          }
          const getFeatureList = (): Array<{}> => {
            // const data1: Array<TableData> = [];
            // while (data1.length < data.itemCount)
            //   data1.push({
            //     name: `${data.features[data1.length]?.name}`,
            //     owner: `${data.features[data1.length]?.owner[0]}`,
            //     modifiedAt: `${data.features[data1.length]?.modifiedAt}`,
            //     createdAt: `${data.features[data1.length]?.createdAt}`,
            //     archived: `${data.features[data1.length]?.archived}`,
            //     kind: `${data.features[data1.length]?.kind}`,
            //     identifier: `${data.features[data1.length]?.identifier}`,
            //     status: `${data.features[data1.length]?.status.status}`,
            //     state: `${data.features[data1.length]?.envProperties.state}`,
            //     pipelineConfigured: `${
            //       data.features[data1.length]?.envProperties.pipelineConfigured
            //     }`,
            //   });
            // return data1;
            const data1 = data.features
              .slice(0, 50)
              .map(
                (feature: {
                  name: any;
                  owner: any[];
                  modifiedAt: any;
                  createdAt: any;
                  archived: any;
                  kind: any;
                  identifier: any;
                  status: { status: any };
                  envProperties: { state: any; pipelineConfigured: any };
                }) => ({
                  name: `${feature?.name}`,
                  owner: `${feature?.owner[0]}`,
                  modifiedAt: `${feature?.modifiedAt}`,
                  createdAt: `${feature?.createdAt}`,
                  archived: `${feature?.archived}`,
                  kind: `${feature?.kind}`,
                  identifier: `${feature?.identifier}`,
                  status: `${feature?.status.status}`,
                  state: `${feature?.envProperties.state}`,
                  pipelineConfigured: `${feature?.envProperties.pipelineConfigured}`,
                }),
              );
            return data1;
          };
          setCurrTableData(getFeatureList());
          setFlag(true);
        }
        fetchFeatures();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, envId]);

  const handleChange = (event: SelectChangeEvent) => {
    setEnvId(event.target.value as string);
    setState(AsyncStatus.Success);
    // setFlag(false);
  };

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
        'Could not find any Feature Flags, the x-api-key is either missing or incorrect in app-config.yaml under proxy settings.';
    else if (!urlParams)
      description =
        'Could not find any Feature Flags, please check your project-url configuration in catalog-info.yaml.';
    else if (state === AsyncStatus.Success && currTableData.length === 0)
      description = 'No Feature Flags configured';
    else
      description =
        'Could not find any Feature Flags, please check your configurations in catalog-info.yaml or check your permissions.';
    return (
      <EmptyState
        title="Harness Feature Flags"
        description={description}
        missing="data"
      />
    );
  }

  return (
    <>
      <div className={classes.container}>
        <Box sx={{ minWidth: 120 }}>
          <FormControl fullWidth>
            <InputLabel
              htmlFor="Environment"
              id="Environment"
              style={{
                marginLeft: 10,
                top: '100%',
                transform: 'translate(0,-10%)',
              }}
            >
              Environment
            </InputLabel>
            <Select
              labelId="Environment"
              id="Environment"
              value={envId}
              label="Environment"
              onChange={handleChange}
            >
              {envIds.map(env => (
                <MenuItem value={env}>{env}</MenuItem>
              ))}
            </Select>
            <FormHelperText />
          </FormControl>
        </Box>
        &nbsp;&nbsp;
        <Table
          options={{ paging: true }}
          data={currTableData ?? []}
          columns={columns}
          actions={[
            {
              icon: () => <RetryIcon />,
              tooltip: 'Refresh Data',
              isFreeAction: true,
              onClick: () => {
                setRefresh(!refresh);
              },
            },
          ]}
          emptyContent={
            <div className={classes.empty}>
              <CircularProgress />
            </div>
          }
          title="Feature Flags"
          totalCount={totalElements}
        />
      </div>
    </>
  );
}
export default FeatureList;
