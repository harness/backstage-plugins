import Swal from 'sweetalert2';
import React, { useState } from 'react';
import { useApi, discoveryApiRef } from '@backstage/core-plugin-api';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
} from '@material-ui/core';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import useRunExperiment from '../../api/useRunExperiment';
import { getIdentifiersFromUrl } from '../../utils/getIdentifiersFromUrl';
import { useProjectUrlFromEntity } from '../../hooks/useGetSlugsFromEntity';

interface RunExperimentButtonProps {
  canNextRun: boolean;
  experimentId: string;
  refetch: () => void;
}

const RunExperimentButton = ({
  canNextRun,
  experimentId,
  refetch,
}: RunExperimentButtonProps) => {
  const discoveryApi = useApi(discoveryApiRef);
  const harnessChaosUrl = useProjectUrlFromEntity();
  const backendBaseUrl = discoveryApi.getBaseUrl('proxy');

  const { accountId, orgId, projectId, env } = getIdentifiersFromUrl(
    harnessChaosUrl || '',
  );

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const { runExperiment } = useRunExperiment({
    backendBaseUrl,
    env,
    experimentId,
    projectId,
    accountId,
    orgId,
  });

  async function handleClick(): Promise<void> {
    const [responseData, status] = await runExperiment();

    if (status === 403) {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top',
        showCloseButton: true,
        showConfirmButton: false,
        width: '500px',
      });

      Toast.fire({
        icon: 'warning',
        title: "You don't have access to run this experiment",
        text: 'Please check your API key configuration',
      });
    }

    if (status === 200 && !responseData.errors) {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });

      Toast.fire({
        icon: 'success',
        title: 'Experiment ran successfully',
      });
      refetch();
    } else {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top',
        showCloseButton: true,
        showConfirmButton: false,
        width: '500px',
      });

      Toast.fire({
        icon: 'error',
        title: 'Experiment Run Trigger Failed',
        text: responseData?.errors?.[0]?.message,
      });
    }
    handleClose();
  }

  return (
    <div>
      <Tooltip title="Run Experiment">
        <IconButton onClick={handleClickOpen} disabled={!canNextRun}>
          <PlayArrowIcon sx={{ color: canNextRun ? '#1bb954' : '#6a6d85' }} />
        </IconButton>
      </Tooltip>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Run Experiment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you want to run this experiment?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button onClick={handleClick} variant="contained" color="primary">
            Run Experiment
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RunExperimentButton;
