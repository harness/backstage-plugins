import React from 'react';
import { CircularProgress } from '@material-ui/core';
import { EmptyState } from '@backstage/core-components';
import { AsyncStatus } from '../../types';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';

interface TableEmptyStateProps {
  status?: AsyncStatus;
  hasData: boolean;
  classes: ClassNameMap<'empty'>;
}

const TableEmptyState: React.FC<TableEmptyStateProps> = ({
  status,
  hasData,
  classes,
}) => {
  const isLoading =
    status === AsyncStatus.Init || status === AsyncStatus.Loading;
  const isEmpty = status === AsyncStatus.Success && !hasData;

  if (isLoading) {
    return (
      <div className={classes.empty}>
        <CircularProgress />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        missing="data"
        title="No data available"
        description="There are no items to display."
      />
    );
  }

  return null;
};

export default TableEmptyState;
