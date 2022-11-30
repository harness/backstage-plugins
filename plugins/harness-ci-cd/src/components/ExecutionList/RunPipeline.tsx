import {
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { TableData } from './ExecutionList';
import ReplayIcon from '@material-ui/icons/Replay';

interface AlertDialogProps {
  row: Partial<TableData>;
  backendBaseUrl: Object;
  query1: string;
}

export function AlertDialog(props: AlertDialogProps) {
  const [open, setOpen] = useState(false);

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
        <DialogTitle>{'Run Pipeline'}</DialogTitle>
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
                props.backendBaseUrl,
                props.query1,
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

export default async function runPipeline(
  row: TableData,
  backendBaseUrl: Object,
  query1: string,
): Promise<void> {
  const response = await fetch(
    `${await backendBaseUrl}/harness/gateway/pipeline/api/pipelines/execution/${
      row.planExecutionId
    }/inputset?${query1}`,
    {},
  );
  const data = await response.text();

  const resp2 = await fetch(
    `${await backendBaseUrl}/harness/gateway/pipeline/api/pipeline/execute/rerun/${
      row.planExecutionId
    }/${row.pipelineId}?${query1}&moduleType=ci`,
    {
      headers: {
        'content-type': 'application/yaml',
      },
      body: `${data}`,
      method: 'POST',
    },
  );
  if (resp2.status == 200) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });

    Toast.fire({
      icon: 'success',
      title: 'Pipeline ran successfully',
    });
  } else if (resp2.status == 403) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top',
      showCloseButton: true,
      showConfirmButton: false,
      width: '500px',
    });

    Toast.fire({
      icon: 'warning',
      title: "You don't have access to trigger this pipeline",
      text: 'Please check your API key configuration',
    });
  } else {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top',
      showCloseButton: true,
      showConfirmButton: false,
    });

    Toast.fire({
      icon: 'error',
      title: 'Pipeline Trigger Failed',
    });
  }
}
