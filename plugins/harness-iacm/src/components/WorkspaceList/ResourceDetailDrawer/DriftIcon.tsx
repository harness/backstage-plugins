import React from 'react';
import ReplayIcon from '@material-ui/icons/Replay';
import DeleteIcon from '@material-ui/icons/Delete';
import LensIcon from '@material-ui/icons/Lens';

export const getDriftIcon = (driftStatus?: string): React.ReactNode => {
  switch (driftStatus?.toLowerCase()) {
    case 'drifted':
      return <ReplayIcon style={{ fontSize: 18, color: '#ff9800' }} />;
    case 'changed':
        return <ReplayIcon style={{ fontSize: 18, color: '#ff9800' }} />;
    case 'deleted':
      return <DeleteIcon style={{ fontSize: 18, color: '#9e9e9e' }} />;
    case 'unchanged':
      return <LensIcon style={{ fontSize: 18, color: '#9e9e9e' }} />;
    default:
      return null;
  }
};

