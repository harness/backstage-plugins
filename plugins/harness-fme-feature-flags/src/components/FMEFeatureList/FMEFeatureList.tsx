import React, { useState, useEffect, useCallback } from 'react';

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
import useGetFeatureState from '../../hooks/useGetFeatureState';
import useGetFeatureStatus from '../../hooks/useGetFeatureStatus';
import useGetOwners from '../../hooks/useGetOwners';
import useGetFlagSets from '../../hooks/useGetFlagSets';

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

function FMEFeatureList() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [resolvedBackendBaseUrl, setResolvedBackendBaseUrl] = useState('');

  const classes = useStyles();
  const discoveryApi = useApi(discoveryApiRef);
  discoveryApi.getBaseUrl('proxy').then(url => setResolvedBackendBaseUrl(url));
  const config = useApi(configApiRef);
  const baseUrl =
    config.getOptionalString('harnessfme.baseUrl') ?? 'https://app.split.io/';
  const { workspaceId, orgId } = useProjectSlugFromEntity();

  // Memoize the refresh callback
  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Consolidate data fetching
  const { ffEnvIds, status: state } = useGetFeatureEnv({
    resolvedBackendBaseUrl,
    workspaceId,
    refresh: refreshTrigger,
  });
  // Initialize envId with null and update it once we have data
  const [envId, setEnvId] = useState({ id: '', name: '' });

  useEffect(() => {
    if (envId.id === '' && ffEnvIds.length > 0) {
      setEnvId(ffEnvIds[0]);
    }
  }, [envId.id, ffEnvIds]);

  const { flagSetsMap } = useGetFlagSets({
    resolvedBackendBaseUrl,
    workspaceId,
    refresh: refreshTrigger,
  });

  const { ownersMap } = useGetOwners({
    resolvedBackendBaseUrl,
    refresh: refreshTrigger,
  });

  const { currTableData, totalElements } = useGetFeatureState({
    workspaceId,
    envId,
    resolvedBackendBaseUrl,
    refresh: refreshTrigger,
  });

  const { featureStatusMap } = useGetFeatureStatus({
    workspaceId,
    envId,
    resolvedBackendBaseUrl,
    refresh: refreshTrigger,
  });

  const handleChange = (selected: SelectedItems) => {
    const selectedEnv = ffEnvIds.find(env => env.name === selected);
    if (selectedEnv) {
      setEnvId(selectedEnv);
    }
  };

  const columns: TableColumn[] = [
    {
      title: 'Feature Name',
      field: 'col1',
      width: '30%',
      render: (row: Partial<TableData>) => {
        const featureStatus = featureStatusMap[row.name as string] || {
          id: '',
        };
        const link = `${baseUrl}org/${orgId}/ws/${workspaceId}/splits/${featureStatus.id}/env/${envId.id}/definition`;
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
      title: 'Killed?',
      field: 'col1',
      width: '10%',
      customSort: (row1: Partial<TableData>, row2: Partial<TableData>) => {
        if (row1.killed === row2.killed) {
          return 0;
        }
        return row1.killed ? 1 : -1;
      },
      render: (row: Partial<TableData>) => {
        return (
          <Typography
            style={{ fontSize: 'medium', color: row.killed ? 'red' : 'green' }}
          >
            <b>{row.killed === true ? 'Killed' : 'Live'} </b>
          </Typography>
        );
      },
    },
    {
      title: 'Owners',
      field: 'col2',
      width: '30%',
      sorting: true,
      customSort: (row1: Partial<TableData>, row2: Partial<TableData>) => {
        // Extract owner names for comparison
        const getOwnerNames = (row: Partial<TableData>) => {
          const featureStatus = featureStatusMap[row.name as string];
          const owners = featureStatus?.owners;
          const ownerData = owners?.map(owner => ownersMap[owner.id]) || [];
          return ownerData
            .map(owner => owner?.name || '')
            .sort() // Sort names alphabetically
            .join(',')
            .toLowerCase();
        };

        const owners1 = getOwnerNames(row1);
        const owners2 = getOwnerNames(row2);

        return owners1.localeCompare(owners2);
      },

      render: (row: Partial<TableData>) => {
        const featureStatus = featureStatusMap[row.name as string];
        const owners = featureStatus?.owners;
        const ownerData = owners?.map(owner => ownersMap[owner.id]) || [];
        const ownerDisplay = ownerData
          .map(owner => {
            if (owner?.type === 'user') {
              return `<a href="mailto:${owner.email}" target="_blank">${owner.name}</a>`;
            } else if (owner?.type === 'group') {
              return `<a href="${baseUrl}org/${orgId}/ws/${workspaceId}/admin/groups/details/${owner.id}" target="_blank"> ${owner.name} (Group) </a>`;
            }
            return owner?.name || '';
          })
          .join(', ');

        return (
          <Typography style={{ fontSize: 'small', color: 'grey' }}>
            <b dangerouslySetInnerHTML={{ __html: ownerDisplay }} />
          </Typography>
        );
      },
    },
    {
      title: 'Traffic Type',
      field: 'col3',
      customSort: (row1: Partial<TableData>, row2: Partial<TableData>) => {
        const a = row1.trafficType?.toLowerCase() ?? '';
        const b = row2.trafficType?.toLowerCase() ?? '';
        return a.localeCompare(b);
      },
      type: 'string',
      render: (row: Partial<TableData>) => {
        return (
          <Typography style={{ fontSize: 'medium', color: 'black' }}>
            <b>{row.trafficType} </b>
          </Typography>
        );
      },
    },
    {
      title: 'Rollout Status',
      field: 'col4',
      type: 'string',
      customSort: (row1: Partial<TableData>, row2: Partial<TableData>) => {
        const status1 =
          featureStatusMap[
            row1.name as string
          ]?.rolloutStatus?.name?.toLowerCase() ?? '';
        const status2 =
          featureStatusMap[
            row2.name as string
          ]?.rolloutStatus?.name?.toLowerCase() ?? '';
        return status1.localeCompare(status2);
      },
      render: (row: Partial<TableData>) => {
        const ffIdentifier = row.name as string;
        const ffStatus = featureStatusMap[ffIdentifier]?.rolloutStatus?.name;
        return (
          <Typography>
            <b>{ffStatus} </b>
          </Typography>
        );
      },
    },
    {
      title: 'Default Treatment',
      field: 'col5',
      type: 'string',
      customSort: (row1: Partial<TableData>, row2: Partial<TableData>) => {
        const a = row1.defaultTreatment?.toLowerCase() ?? '';
        const b = row2.defaultTreatment?.toLowerCase() ?? '';
        return a.localeCompare(b);
      },
      render: (row: Partial<TableData>) => {
        return (
          <Typography style={{ fontSize: 'small' }}>
            <b>{`${row.defaultTreatment}`} </b>
          </Typography>
        );
      },
    },

    {
      title: 'Flag Sets',
      field: 'col6',
      type: 'string',
      customSort: (row1: Partial<TableData>, row2: Partial<TableData>) => {
        const sets1 =
          row1.flagSets
            ?.map((f: { id: string | number }) => flagSetsMap[f.id]?.name)
            .join(',')
            .toLowerCase() ?? '';
        const sets2 =
          row2.flagSets
            ?.map((f: { id: string | number }) => flagSetsMap[f.id]?.name)
            .join(',')
            .toLowerCase() ?? '';
        return sets1.localeCompare(sets2);
      },
      render: (row: Partial<TableData>) => {
        return (
          <Typography style={{ fontSize: 'small' }} noWrap>
            <b>
              {`${
                row.flagSets && row.flagSets.length > 0
                  ? row.flagSets
                      .map(
                        (f: { id: string; type: string }) => flagSetsMap[f.id],
                      )
                      .map((fs: { name: string }) => fs.name)
                      .join(', ')
                  : 'None'
              }`}{' '}
            </b>
          </Typography>
        );
      },
    },
    {
      title: 'Created at',
      field: 'col7',
      type: 'date',
      customSort: (row1: Partial<TableData>, row2: Partial<TableData>) => {
        const date1 = row1.creationTime
          ? new Date(row1.creationTime).getTime()
          : 0;
        const date2 = row2.creationTime
          ? new Date(row2.creationTime).getTime()
          : 0;
        return date1 - date2;
      },
      render: (row: Partial<TableData>) => {
        const time = dayjs(row.creationTime).format(
          'DD MMM YYYY HH:mm A [GMT]',
        );
        return <Typography>{time}</Typography>;
      },
    },
    {
      title: 'Modified At',
      field: 'col8',
      type: 'date',
      customSort: (row1: Partial<TableData>, row2: Partial<TableData>) => {
        const date1 = row1.lastUpdateTime
          ? new Date(row1.lastUpdateTime).getTime()
          : 0;
        const date2 = row2.lastUpdateTime
          ? new Date(row2.lastUpdateTime).getTime()
          : 0;
        return date1 - date2;
      },
      render: (row: Partial<TableData>) => {
        const time = dayjs(row.lastUpdateTime).format(
          'DD MMM YYYY HH:mm A [GMT]',
        );
        return <Typography>{time}</Typography>;
      },
    },
    {
      title: 'Last Traffic Recieved',
      field: 'col9',
      type: 'date',
      customSort: (row1: Partial<TableData>, row2: Partial<TableData>) => {
        const date1 = row1.lastTrafficReceivedAt
          ? new Date(row1.lastTrafficReceivedAt).getTime()
          : 0;
        const date2 = row2.lastTrafficReceivedAt
          ? new Date(row2.lastTrafficReceivedAt).getTime()
          : 0;
        return date1 - date2;
      },
      render: (row: Partial<TableData>) => {
        const time = row.lastTrafficReceivedAt
          ? dayjs(row.lastTrafficReceivedAt).format('DD MMM YYYY HH:mm A [GMT]')
          : 'Never';
        return <Typography>{time}</Typography>;
      },
    },
  ];

  // Error and empty states handling
  if (
    (!workspaceId && !orgId) ||
    state === AsyncStatus.Error ||
    state === AsyncStatus.Unauthorized
  ) {
    let description = '';
    if (state === AsyncStatus.Unauthorized) {
      description =
        'Could not find any Feature Flags, the bearer auth token is either missing or incorrect in app-config.yaml under proxy settings.';
    } else if (!workspaceId && !orgId) {
      description =
        'Could not find any Feature Flags, please check your workspaceId and orgId configuration in catalog-info.yaml.';
    } else {
      description =
        'Could not find any Feature Flags, please check your configurations in catalog-info.yaml or check your token permissions.';
    }
    return (
      <EmptyState
        title="Harness FME Feature Flags"
        description={description}
        missing="data"
      />
    );
  }

  return (
    <div className={classes.container}>
      <Box marginBottom={4}>
        <SelectComponent
          label="Environment"
          items={ffEnvIds.map(item => ({ value: item.name, label: item.name }))}
          onChange={handleChange}
          selected={envId.name}
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
            onClick: refresh,
          },
        ]}
        emptyContent={
          !ownersMap ||
          !ffEnvIds.length ||
          !currTableData ||
          !featureStatusMap ||
          !flagSetsMap ? (
            <div className={classes.empty}>
              <CircularProgress />
            </div>
          ) : null
        }
        title="Feature Flags"
        totalCount={totalElements}
      />
    </div>
  );
}

export default FMEFeatureList;
