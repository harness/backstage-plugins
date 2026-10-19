import React from 'react';

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  makeStyles,
} from '@material-ui/core';

import CheckIcon from '@mui/icons-material/Check';

const useStyles = makeStyles(theme => ({
  formControl: {
    marginLeft: theme.spacing(1),
    minWidth: 300,
    height: 56,
  },
  checkIcon: {
    marginLeft: '6px',
  },
}));

const allInfrastructures = [
  {
    label: 'Kubernetes (Legacy)',
    value: 'Kubernetes',
  },
  {
    label: 'Kubernetes (Harness Infrastructure)',
    value: 'KubernetesV2',
  },
  {
    label: 'Linux',
    value: 'Linux',
  },
  {
    label: 'Windows',
    value: 'Windows',
  },
];

interface InfrastructureFilterProps {
  /** selected infrastructure type, empty string for all */
  value: string;
  onChange: (value: string) => void;
}

export const InfrastructureFilter = ({
  value,
  onChange,
}: InfrastructureFilterProps) => {
  const classes = useStyles();

  return (
    <FormControl className={classes.formControl}>
      <InputLabel shrink>Filter Infrastructures</InputLabel>
      <Select
        displayEmpty
        value={value}
        onChange={e => onChange(e.target.value as string)}
        renderValue={selected =>
          allInfrastructures.find(infra => infra.value === selected)?.label ??
          'All Infrastructures'
        }
      >
        <MenuItem value="">
          <em>All Infrastructures</em>
        </MenuItem>
        {allInfrastructures.map(infra => (
          <MenuItem key={infra.value} value={infra.value}>
            {infra.label}
            {value === infra.value ? (
              <CheckIcon
                className={classes.checkIcon}
                color="info"
                fontSize="small"
              />
            ) : null}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
