import React, { useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  Link,
  makeStyles,
  Typography,
} from '@material-ui/core';
import {
  EmptyState,
  Table,
  TableColumn,
  Select as SelectComponent,
  SelectedItems,
} from '@backstage/core-components';
import RetryIcon from '@material-ui/icons/Replay';
import {
  discoveryApiRef,
  useApi,
  configApiRef,
} from '@backstage/core-plugin-api';
import { useProjectSlugFromEntity } from './useProjectSlugEntity';
import dayjs from 'dayjs';
import { AsyncStatus, TableData } from '../../types';
import useGetFeatureEnv from '../../hooks/useGetFeatureEnv';
import useGetFeatureStatus from '../../hooks/useGetFeatureStatus';

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

function FeatureList() {
  const [refresh, setRefresh] = useState(false);
  const [envId, setEnvId] = React.useState('');

  const classes = useStyles();
  const discoveryApi = useApi(discoveryApiRef);
  const backendBaseUrl = discoveryApi.getBaseUrl('proxy');
  const config = useApi(configApiRef);
  const baseUrl =
    config.getOptionalString('harness.baseUrl') ?? 'https://app.harness.io/';

  const { projectId, orgId, accountId, urlParams, envFromUrl } =
    useProjectSlugFromEntity();

  const { ffEnvIds, status: state } = useGetFeatureEnv({
    backendBaseUrl,
    accountId,
    orgId,
    projectId,
    refresh,
    envFromUrl,
  });

  const { currTableData, totalElements, isCallDone } = useGetFeatureStatus({
    accountId,
    projectId,
    envId,
    orgId,
    backendBaseUrl,
    refresh,
    envFromUrl,
  });

  useEffect(() => {
    if (!envId) {
      setEnvId(ffEnvIds[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ffEnvIds]);

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
        const time = dayjs(row.createdAt).format('DD MMM YYYY HH:mm A [GMT]');
        return <Typography>{time}</Typography>;
      },
    },

    {
      title: 'Modified At',
      field: 'col7',
      type: 'date',
      render: (row: Partial<TableData>) => {
        const time = dayjs(row.modifiedAt).format('DD MMM YYYY HH:mm A [GMT]');
        return <Typography>{time}</Typography>;
      },
    },
  ];

  const handleChange = (event: SelectedItems) => {
    setEnvId(event as string);
  };

  if (
    !urlParams ||
    state === AsyncStatus.Error ||
    state === AsyncStatus.Unauthorized ||
    (state === AsyncStatus.Success && currTableData.length === 0 && isCallDone)
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
        <Box marginBottom={4}>
          <SelectComponent
            label="Enviornment"
            items={ffEnvIds.map(item => ({ value: item, label: item }))}
            onChange={handleChange}
            selected={envId}
          />
        </Box>
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
