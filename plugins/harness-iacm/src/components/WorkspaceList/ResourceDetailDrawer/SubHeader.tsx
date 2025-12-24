import React from 'react';
import { Box, Typography, Divider } from '@material-ui/core';
import { useStyles } from './styles';

interface SubHeaderProps {
  name?: string;
  provider?: string;
  module?: string;
}

const SubHeader: React.FC<SubHeaderProps> = ({ name, provider, module }) => {
  const classes = useStyles();

  if (!name && !provider && !module) return null;

  return (
    <Box className={classes.drawerSubHeader}>
      <Box className={classes.subHeaderItem}>
        <Typography className={classes.subHeaderLabel}>Name:</Typography>
        <Typography className={classes.subHeaderValue}>{name || '-'}</Typography>
      </Box>
      <Divider orientation="vertical" className={classes.subHeaderDivider} flexItem />
      <Box className={classes.subHeaderItem}>
        <Typography className={classes.subHeaderLabel}>Provider:</Typography>
        <Typography className={classes.subHeaderValue}>{provider || '-'}</Typography>
      </Box>
      <Divider orientation="vertical" className={classes.subHeaderDivider} flexItem />
      <Box className={classes.subHeaderItem}>
        <Typography className={classes.subHeaderLabel}>Module:</Typography>
        <Typography className={classes.subHeaderValue}>{module || '-'}</Typography>
      </Box>
    </Box>
  );
};

export default SubHeader;

