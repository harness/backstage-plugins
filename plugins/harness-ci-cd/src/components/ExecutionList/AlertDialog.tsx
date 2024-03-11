import React, { useState } from 'react';
import { IconButton } from '@material-ui/core';
// eslint-disable-next-line no-restricted-imports
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
} from '@mui/material';
import ReplayIcon from '@material-ui/icons/Replay';
import { TableData } from '../types';

interface AlertDialogProps {
  row: Partial<TableData>;
  backendBaseUrl: Object;
  query1: string;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  refresh: boolean;
  runPipeline: any;
}

export function AlertDialog(props: AlertDialogProps) {
  const [open, setOpen] = useState(false);
  const { runPipeline } = props;

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Tooltip title="Re-run Pipeline" arrow>
        <IconButton aria-label="replay" onClick={handleClickOpen}>
          <ReplayIcon />
        </IconButton>
      </Tooltip>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Run Pipeline</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you want to re-run this pipeline?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined" color="error">
            cancel
          </Button>
          <Button
            onClick={() => {
              handleClose();
              runPipeline(
                Object(props.row),
                props.query1,
                props.setRefresh,
                props.refresh,
              );
            }}
            variant="contained"
            color="success"
          >
            Run Pipeline
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
