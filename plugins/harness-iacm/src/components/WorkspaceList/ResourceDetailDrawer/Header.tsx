import React from 'react';
import { Box, Typography, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { useStyles } from './styles';

interface HeaderProps {
  title: string;
  icon?: React.ReactNode;
  onClose: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, icon, onClose }) => {
  const classes = useStyles();

  return (
    <Box className={classes.drawerHeader}>
      <Box display="flex" alignItems="center">
        {icon && <Box className={classes.iconContainer}>{icon}</Box>}
        <Typography variant="h6" className={classes.drawerTitle}>
          {title}
        </Typography>
      </Box>
      <IconButton
        onClick={onClose}
        aria-label="close drawer"
        edge="end"
        style={{ padding: 0 }}
      >
        <CloseIcon />
      </IconButton>
    </Box>
  );
};

export default Header;
