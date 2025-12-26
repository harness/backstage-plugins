import React from 'react';
import {
  CircularProgress,
  Typography,
  Box,
  makeStyles,
} from '@material-ui/core';
import { AsyncStatus } from '../types';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';

const useStyles = makeStyles(theme => ({
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(8, 2),
    minHeight: 200,
  },
  emptyText: {
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(2),
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(4),
    minHeight: 200,
  },
}));

interface TableEmptyStateProps {
  status?: AsyncStatus;
  hasData: boolean;
  classes: ClassNameMap<'empty'>;
}

const TableEmptyState: React.FC<TableEmptyStateProps> = ({
  status,
  hasData,
}) => {
  const localClasses = useStyles();
  const isLoading =
    status === AsyncStatus.Init || status === AsyncStatus.Loading;
  const isEmpty = status === AsyncStatus.Success && !hasData;

  if (isLoading) {
    return (
      <div className={localClasses.loadingContainer}>
        <CircularProgress />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <Box className={localClasses.emptyContainer}>
        <Typography variant="h6" color="textSecondary">
          No data available
        </Typography>
        <Typography variant="body2" className={localClasses.emptyText}>
          There are no items to display in this table.
        </Typography>
      </Box>
    );
  }

  return null;
};

export default TableEmptyState;
