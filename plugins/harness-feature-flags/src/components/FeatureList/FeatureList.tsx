/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-inner-declarations */
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
import {
  Table,
  TableColumn,
} from '@backstage/core-components';
// import ReplayIcon from '@material-ui/icons/Replay';
import RetryIcon from '@material-ui/icons/Replay';
// import { Link as RouterLink } from 'react-router-dom';
// import { harnessFeatureRouteRef } from '../../route-refs';
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
// import { getRandomValues } from 'crypto';
// import { env } from 'process';


interface TableData {
  name: string;
  archived: string;
  owner: string;
  createdAt?: string;
  modifiedAt?: any;
  kind?: string;
  identifier: string;
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
  const [currTableData] = useState<any[]>([]);
  const [envIds, setEnvIds] = useState<string[]>([]);
  const [envId, setEnvId] = React.useState('');
  const [totalElements, setTotalElements] = useState(50);
  // const [state, setState] = useState<AsyncStatus>(AsyncStatus.Init);
  const [done, setDone] = useState<boolean>(false);

  const classes = useStyles();
  const discoveryApi = useApi(discoveryApiRef);
  const backendBaseUrl = discoveryApi.getBaseUrl('proxy');
  const config = useApi(configApiRef);
  const baseUrl =
    config.getOptionalString('harness.baseUrl') ?? 'https://app.harness.io/';

  const { projectId, orgId, accountId } = useProjectSlugFromEntity();

  async function getFeatureEnv() {
    const resp = await fetch(
      `${await backendBaseUrl}/harness/gateway/ng/api/environments?accountId=${accountId}&outingId=${accountId}&orgIdentifier=${orgId}&projectIdentifier=${projectId}`,
    );
    const data = await resp.json();
    data?.data?.content.map((obj: any) => {
      setEnvIds(env => [...env, obj.identifier]);
    });
    setDone(true);
    setRefresh(!refresh);
  }
  useEffect(() => {
    getFeatureEnv();
  }, []);

  // console.log(envIds);


  const columns: TableColumn[] = [
    {
      title: 'State',
      field: 'col1',
      width: '22%',
      render: (row: Partial<TableData>) => {
        return (
          <Typography style={{ fontSize: 'small', color: 'grey' }}>
            <b>{row.archived} </b>
          </Typography>
        );
      },
    },
    {
      title: 'Feature Name',
      field: 'col2',
      width: '18%',
      render: (row: Partial<TableData>) => {
        const link = `${baseUrl}ng/#/account/${accountId}/cf/orgs/${orgId}/projects/${projectId}/feature-flags/${row.identifier}?tab=activity&activeEnvironment=${envId}`;
        return <Link href={link} target="_blank" />;
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
      field: 'col3',
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
      field: 'col4',
      type: 'string',
      render: (row: Partial<TableData>) => {
        return (
          <Typography style={{ fontSize: 'small', color: 'grey' }}>
            <b>{row.kind} </b>
          </Typography>
        );
      },
    },
    {
      title: 'Created at',
      field: 'col5',
      type: 'date',
      render: (row: Partial<TableData>) => {
        const time = dayjs(row.createdAt).format('DD MMM YYYY HH:mm');
        return <Typography>{time}</Typography>;
      },
    },

    {
      title: 'Modified At',
      field: 'col6',
      type: 'date',
      render: (row: Partial<TableData>) => {
        const time = dayjs(row.modifiedAt).format('DD MMM YYYY HH:mm');
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
        async function fetchFeatures() {
          const resp2 = await fetch(
            `${await backendBaseUrl}/harness/gateway/cf/admin/features?${query}`,
          );
          const data = await resp2.json();
          const tableData = data.data.content;
          if (data.data.totalElements < 50) {
            setTotalElements(data.data.totalElements);
          }
          const getFeatureList = (): Array<{}> => {
          const data1: Array<TableData> = [];
            data1.push({
              name: `${tableData[data1.length]?.features[0].identifier}`,
              owner: `${tableData[data1.length]?.features[0].owner[0]}`,
              modifiedAt: `${tableData[data1.length]?.features[0].modifiedAt}`,
              createdAt: `${tableData[data1.length]?.features[0].createdAt}`,
              archived: `${tableData[data1.length]?.features[0].archived}`,
              kind: `${tableData[data1.length]?.features[0].kind}`,
              identifier: `${tableData[data1.length]?.identifier}`,   
            });
            return data1;
          };
          getFeatureList();

        }
        fetchFeatures();
      }

    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, envId]);
  

  const handleChange = (event: SelectChangeEvent) => {
    setEnvId(event.target.value as string);
  };

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
          options={{ paging: true, filtering: true }}
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
