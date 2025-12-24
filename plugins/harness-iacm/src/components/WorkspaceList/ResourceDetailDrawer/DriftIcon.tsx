import React from 'react';
import ReplayCircleFilledIcon from '@mui/icons-material/ReplayCircleFilled';
import DeleteIcon from '@material-ui/icons/Delete';
import CircleIcon from '@mui/icons-material/Circle';

export const getDriftIcon = (driftStatus?: string): React.ReactNode => {
  switch (driftStatus?.toLowerCase()) {
    case 'drifted':
      return <ReplayCircleFilledIcon style={{ fontSize: 18, color: '#ff9800' }} />;
    case 'changed':
        return <ReplayCircleFilledIcon style={{ fontSize: 18, color: '#ff9800' }} />;
    case 'deleted':
      return <DeleteIcon style={{ fontSize: 18, color: '#9e9e9e' }} />;
    case 'unchanged':
      return <CircleIcon style={{ fontSize: 18, color: '#9e9e9e' }} />;
    default:
      return null;
  }
};

