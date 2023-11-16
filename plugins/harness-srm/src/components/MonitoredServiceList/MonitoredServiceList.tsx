import { discoveryApiRef, useApi } from '@backstage/core-plugin-api';
import React from 'react';
import useGetMonitoredServiceList from '../../hooks/useGetMonitoredServiceList';
import { useProjectSlugFromEntity } from '../../hooks/useProjectSlugFromEntity';
import useServiceSlugEntity from '../../hooks/useServiceSlugEntity';
import { CircularProgress, makeStyles } from '@material-ui/core';
import { AsyncStatus } from '../types';
import CollapsibleTable from './CollapsibleTable';
import useGetLicencse from '../../hooks/useGetLicense';
import { EmptyState } from '@backstage/core-components';


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

function MonitoredServiceList() {
  const discoveryApi = useApi(discoveryApiRef);
  const classes = useStyles();
  const backendBaseUrl = discoveryApi.getBaseUrl('proxy');
  const {
    harnessServicesObject,
  } = useServiceSlugEntity();

  const selectedServiceUrl = harnessServicesObject[Object.keys(harnessServicesObject)[0]];

  const {
    orgId,
    accountId,
    serviceId,
    baseUrl1,
    projectIds,
    envFromUrl,
    urlParams
  } = useProjectSlugFromEntity(
    selectedServiceUrl
  );

  const allProjects = projectIds?.split(',').map(item => item.trim());
  const envToUse = envFromUrl;
  const projectToUse = allProjects?.[0];

  const {
    status: state,
    currTableData,
    flag,
  } = useGetMonitoredServiceList({
    accountId,
    orgId,
    currProject: projectToUse,
    serviceId,
    env: envToUse,
    backendBaseUrl,
  });

  const { licenses } = useGetLicencse({
    backendBaseUrl,
    env: envToUse,
    accountId,
  });

  if (licenses === "NA") {
    return (
      <EmptyState
        title="SRM Module License not subscribed"
        missing="info"
        description="You need to subscribe to SRM Module to view this page."
      />
    )
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
        'Could not find the Monitored Services, the x-api-key is either missing or incorrect in app-config.yaml under proxy settings.';
    else if (!urlParams)
      description =
        'Could not find the Monitored Service, please check your service-url configuration in catalog-info.yaml.';
    else if (state === AsyncStatus.Success && currTableData.length === 0)
      description = 'No Monitored Services found for the given service.';
    else
      description =
        'Could not find the Monitored Services, please check your configurations in catalog-info.yaml or check your permissions.';
    return (
      <>
        <EmptyState
          title="Harness SRM Monitored Services"
          description={description}
          missing="data"
        />
      </>
    );
  }

  return (
    <>
      <div className={classes.container}>
        <CollapsibleTable
          baseUrl1={baseUrl1}
          accountId={accountId}
          orgId={orgId}
          currProject={projectToUse}
          backendBaseUrl={backendBaseUrl}
          data={currTableData}
          env={envToUse} />
      </div>
    </>
  );
}

export default MonitoredServiceList;



