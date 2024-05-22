import React from 'react';

import Grid from '@mui/material/Grid';
import { makeStyles } from '@mui/styles';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';

import {
  useGetNetworkMapEntity,
  useGetServiceEntity,
} from '../../hooks/useGetSlugsFromEntity';
import { EmptyState } from '@backstage/core-components';

const useStyles = makeStyles({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: '2px',
    fontSize: '14px !important',
  },
  empty: {
    padding: '32px',
    display: 'flex',
    justifyContent: 'center',
  },
});

const ChaosExperimentsV2: React.FC = () => {
  const classes = useStyles();

  // get all services from entity
  const harnessChaosServices = useGetServiceEntity();

  // get all network maps from entity
  const harnessChaosNM = useGetNetworkMapEntity();
  // get name of all the projects
  const allServices = Object.keys(harnessChaosServices);
  const allNMs = Object.keys(harnessChaosNM);

  const ServiceDropDown =
    allServices && allServices?.length > 1 ? (
      <FormControl fullWidth>
        <InputLabel
          htmlFor="Service"
          classes={{
            root: classes.label,
          }}
        >
          Service
        </InputLabel>
        <Select labelId="Service" id="Service" value={allServices[0]}>
          {allServices.map(serv => (
            <MenuItem value={serv}>{serv}</MenuItem>
          ))}
        </Select>
        <FormHelperText />
      </FormControl>
    ) : null;

  const NMDropDown =
    allNMs && allNMs?.length > 1 ? (
      <FormControl fullWidth>
        <InputLabel
          htmlFor="Network Map"
          classes={{
            root: classes.label,
          }}
        >
          Network Map
        </InputLabel>
        <Select labelId="Network Map" id="Network Map" value={allNMs[0]}>
          {allNMs.map(nm => (
            <MenuItem value={nm}>{nm}</MenuItem>
          ))}
        </Select>
        <FormHelperText />
      </FormControl>
    ) : null;

  const DropDownComponent = (
    <Grid container spacing={3}>
      <Grid item md={3}>
        {ServiceDropDown}
      </Grid>

      <Grid item md={3}>
        {NMDropDown}
      </Grid>
    </Grid>
  );

  return (
    <div className={classes.container}>
      {DropDownComponent}
      <EmptyState
        missing="content"
        title="Service Discovery Unavailable"
        description="Service based Chaos Engineering support will be added to the plugin soon"
      />
    </div>
  );
};

export default ChaosExperimentsV2;
