import React from 'react';
import { Link } from '@backstage/core-components';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import { makeStyles } from '@mui/styles';
import Popper from '@mui/material/Popper';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import ErrorIcon from '@mui/icons-material/Error';
import PauseIcon from '@mui/icons-material/Pause';
import CancelIcon from '@mui/icons-material/Cancel';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined';
import NotInterestedOutlinedIcon from '@mui/icons-material/NotInterestedOutlined';

import { timeDifference } from '../../utils/getTimeDifference';
import { ExperimentRunStatus, RecentWorkflowRun } from '../../api/types';
import { getIdentifiersFromUrl } from '../../utils/getIdentifiersFromUrl';
import { useProjectUrlFromEntity } from '../../hooks/useGetSlugsFromEntity';

const useStyles = makeStyles(() => ({
  statusHeatMap: {
    display: 'flex',
    alignItems: 'end',
    columnGap: '0.25rem',
    lineHeight: 0,
  },
  statusHeatMapCell: {
    width: '18px',
    height: '18px',
    borderRadius: '2px',
    flex: '0 0 auto',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&[data-state="completed"]': {
      backgroundColor: '#4dc952',
      '&:hover, &:focus': {
        boxShadow: '#fff 0px 0px 0px 1px, #d8f3d4 0px 0px 0px 2px',
      },
    },
    '&[data-state="queued"]': {
      backgroundColor: '#e5e1f4',
      '&:hover, &:focus': {
        boxShadow: '#fff 0px 0px 0px 1px, #e5e1f4 0px 0px 0px 2px',
      },
    },
    '&[data-state="completed_with_error"]': {
      backgroundColor: '#ff832b',
      '&:hover, &:focus': {
        boxShadow: '#fff 0px 0px 0px 1px, #fff0e6	 0px 0px 0px 2px',
      },
    },
    '&[data-state="completed_with_probe_failure"]': {
      backgroundColor: '#ff832b',
      '&:hover, &:focus': {
        boxShadow: '#fff 0px 0px 0px 1px, #fff0e6 0px 0px 0px 2px',
      },
    },
    '&[data-state="error"]': {
      backgroundColor: '#fcedec',
      '&:hover, &:focus': {
        boxShadow: '#fff 0px 0px 0px 1px, #fbe6e4 0px 0px 0px 2px',
      },
    },
    '&[data-state="timeout"]': {
      backgroundColor: '#fcedec',
      '&:hover, &:focus': {
        boxShadow: '#fff 0px 0px 0px 1px, #fbe6e4 0px 0px 0px 2px',
      },
    },
    '&[data-state="running"]': {
      backgroundColor: '#5b44ba',
      '&:hover, &:focus': {
        boxShadow: '#fff 0px 0px 0px 1px, #e5e1f4 0px 0px 0px 2px',
      },
    },
    '&[data-state="stopped"]': {
      backgroundColor: '#d9dae5',
      '&:hover, &:focus': {
        boxShadow: '#fff 0px 0px 0px 1px, #d9dae5 0px 0px 0px 2px',
      },
    },
    '&[data-state="na"]': {
      height: '12px',
      backgroundColor: '#d9dae5',
      '&:hover, &:focus': {
        boxShadow: '#fff 0px 0px 0px 1px, #d9dae5 0px 0px 0px 2px',
      },
    },
    '&[aria-disabled="true"]': {
      '&:hover': {
        boxShadow: 'none !important',
      },
    },
  },
  popper: {
    zIndex: 1,
  },
  paper: {
    width: '300px',
    maxWidth: 400,
    overflow: 'auto',
    backgroundColor: '#17293F',
  },
}));

function StatusIcon({ status }: StatusIconProps): React.ReactElement {
  switch (status) {
    case ExperimentRunStatus.COMPLETED:
      return <CheckCircleIcon style={{ color: '#1b841d', fontSize: '12px' }} />;
    case ExperimentRunStatus.COMPLETED_WITH_PROBE_FAILURE:
    case ExperimentRunStatus.COMPLETED_WITH_ERROR:
      return <ErrorIcon style={{ color: '#ff832b', fontSize: '12px' }} />;
    case ExperimentRunStatus.ERROR:
      return <CancelIcon style={{ color: '#da291d', fontSize: '12px' }} />;
    case ExperimentRunStatus.TIMEOUT:
      return <AccessTimeIcon style={{ color: '#da291d', fontSize: '12px' }} />;
    case ExperimentRunStatus.RUNNING:
      return <MoreHorizIcon style={{ color: '#ffffff', fontSize: '12px' }} />;
    case ExperimentRunStatus.QUEUED:
      return <PauseIcon style={{ color: '#9d8ed6', fontSize: 12 }} />;
    case ExperimentRunStatus.STOPPED:
      return (
        <StopCircleOutlinedIcon
          style={{ color: '#383946', fontSize: '12px' }}
        />
      );
    default:
      return (
        <NotInterestedOutlinedIcon
          sx={{ color: '#383946', fontSize: '12px' }}
        />
      );
  }
}

function StatusChip({ status }: StatusIconProps): React.ReactElement {
  switch (status) {
    case ExperimentRunStatus.COMPLETED:
      return (
        <Chip
          icon={<CheckCircleIcon style={{ color: 'white' }} />}
          label="Completed"
          style={{ backgroundColor: '#1b841d', color: 'white' }}
        />
      );
    case ExperimentRunStatus.COMPLETED_WITH_PROBE_FAILURE:
    case ExperimentRunStatus.COMPLETED_WITH_ERROR: // <!-- needed for backwards compatibility -->
      return (
        <Chip
          label="Completed"
          icon={<ErrorIcon style={{ color: 'white' }} />}
          style={{ backgroundColor: '#ff832b', color: 'white' }}
        />
      );
    case ExperimentRunStatus.ERROR:
      return (
        <Chip
          icon={<CancelIcon style={{ color: 'white' }} />}
          label="Error"
          style={{ backgroundColor: '#da291d', color: 'white' }}
        />
      );
    case ExperimentRunStatus.TIMEOUT:
      return (
        <Chip
          icon={<AccessTimeIcon style={{ color: 'white' }} />}
          label="Timeout"
          style={{ backgroundColor: '#da291d', color: 'white' }}
        />
      );
    case ExperimentRunStatus.RUNNING:
      return (
        <Chip
          icon={<MoreHorizIcon style={{ color: 'black' }} />}
          label="Running"
          style={{ backgroundColor: '#ffffff', color: 'black' }}
        />
      );
    case ExperimentRunStatus.QUEUED:
      return (
        <Chip
          icon={<PauseIcon style={{ color: 'white' }} />}
          label="Queued"
          style={{ backgroundColor: '#9d8ed6', color: 'white' }}
        />
      );
    case ExperimentRunStatus.STOPPED:
      return (
        <Chip
          icon={<StopCircleOutlinedIcon style={{ color: 'white' }} />}
          label="Stopped"
          style={{ backgroundColor: '#383946', color: 'white' }}
        />
      );
    default:
      return (
        <Chip
          icon={<NotInterestedOutlinedIcon sx={{ color: 'white' }} />}
          label="N/A"
          style={{ backgroundColor: '#383946', color: 'white' }}
        />
      );
  }
}

interface StatusCell {
  execution: RecentWorkflowRun;
}

interface StatusIconProps {
  status: ExperimentRunStatus;
}

export interface StatusHeatMapProps {
  data: RecentWorkflowRun[];
  experimentID: string;
}

function hideIconForStatus(experimentRunStatus: ExperimentRunStatus): boolean {
  switch (experimentRunStatus) {
    case ExperimentRunStatus.COMPLETED:
    case ExperimentRunStatus.COMPLETED_WITH_PROBE_FAILURE:
    case ExperimentRunStatus.COMPLETED_WITH_ERROR:
    case ExperimentRunStatus.NA:
      return true;
    default:
      return false;
  }
}

function hidePopperForStatus(
  experimentRunStatus: ExperimentRunStatus,
): boolean {
  switch (experimentRunStatus) {
    case ExperimentRunStatus.NA:
      return true;
    default:
      return false;
  }
}

export function StatusHeatMap(props: StatusHeatMapProps): React.ReactElement {
  const classes = useStyles();
  const { data, experimentID } = props;

  const harnessChaosUrl = useProjectUrlFromEntity();

  const { accountId, orgId, projectId, baseUrl } = getIdentifiersFromUrl(
    harnessChaosUrl || '',
  );

  const getExperimentRunLink = (
    expId: string,
    notifyId: string | undefined,
    runId: string | undefined,
  ) => {
    if (!notifyId || !runId) return '';
    if (notifyId)
      return `${baseUrl}/ng/account/${accountId}/chaos/orgs/${orgId}/projects/${projectId}/experiments/${expId}/notifyID/${notifyId}`;
    return `${baseUrl}/ng/account/${accountId}/chaos/orgs/${orgId}/projects/${projectId}/experiments/${expId}/runID/${runId}`;
  };

  function StatusCell({ execution }: StatusCell): React.ReactElement {
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
      setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    return (
      <div
        data-state={execution?.phase?.replace(/ /g, '_').toLowerCase()}
        className={classes.statusHeatMapCell}
        aria-owns={open ? 'mouse-over-popover' : undefined}
        aria-haspopup="true"
        aria-disabled={hidePopperForStatus(execution.phase)}
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
      >
        {!hideIconForStatus(execution.phase) && (
          <div>
            <StatusIcon status={execution.phase} />
          </div>
        )}
        {!hidePopperForStatus(execution.phase) && (
          <Popper
            id="mouse-over-popover"
            sx={{
              pointerEvents: 'none',
            }}
            open={open}
            anchorEl={anchorEl}
            className={classes.popper}
          >
            <Box
              sx={{
                position: 'relative',
                mt: '10px',
                '&::before': {
                  backgroundColor: '#17293F',
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  width: 14,
                  height: 14,
                  top: -5,
                  transform: 'rotate(45deg)',
                  left: 'calc(50% - 6px)',
                },
              }}
            />
            <Paper className={classes.paper}>
              <List sx={{ width: '100%', maxWidth: 300 }}>
                <ListItem>
                  <Box sx={{ width: '45%' }}>
                    <ListItemText
                      primary={
                        <React.Fragment>
                          <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body2"
                            color="white"
                            display="inline"
                          >
                            Resilience Score:
                          </Typography>
                        </React.Fragment>
                      }
                    />
                  </Box>
                  <Box sx={{ width: '55%' }}>
                    <ListItemText
                      primary={
                        <React.Fragment>
                          <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="h6"
                            color={
                              // eslint-disable-next-line no-nested-ternary
                              execution.resiliencyScore === 100
                                ? 'green'
                                : execution.resiliencyScore === 0
                                ? 'red'
                                : 'orange'
                            }
                            display="inline"
                          >
                            {`${(execution.resiliencyScore ?? 0).toString()} `}
                          </Typography>
                          <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body2"
                            color="white"
                            display="inline"
                          >
                            / 100
                          </Typography>
                        </React.Fragment>
                      }
                    />
                  </Box>
                </ListItem>
                <ListItem>
                  <Box sx={{ width: '45%' }}>
                    <ListItemText
                      primary={
                        <React.Fragment>
                          <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body2"
                            color="white"
                            display="inline"
                          >
                            Status:
                          </Typography>
                        </React.Fragment>
                      }
                    />
                  </Box>
                  <Box sx={{ width: '55%' }}>
                    <StatusChip status={execution.phase} />
                  </Box>
                </ListItem>
                <ListItem>
                  <Box sx={{ width: '45%' }}>
                    <ListItemText
                      primary={
                        <React.Fragment>
                          <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body2"
                            color="white"
                            display="inline"
                          >
                            Executed by:
                          </Typography>
                        </React.Fragment>
                      }
                    />
                  </Box>
                  <Box sx={{ width: '55%' }}>
                    <ListItemText
                      primary={
                        <React.Fragment>
                          <Typography
                            sx={{
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              textOverflow: 'ellipsis',
                              lineClamp: 1,
                            }}
                            variant="body2"
                            color="white"
                          >
                            {execution.createdBy?.username ||
                              'Chaos Controller'}
                          </Typography>
                        </React.Fragment>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography
                            component="span"
                            variant="caption"
                            fontSize="0.6rem"
                            color="white"
                          >
                            {timeDifference(
                              new Date().getTime(),
                              Number(execution.createdAt),
                            )}
                          </Typography>
                        </React.Fragment>
                      }
                    />
                  </Box>
                </ListItem>
              </List>
            </Paper>
          </Popper>
        )}
      </div>
    );
  }

  return (
    <div className={classes.statusHeatMap}>
      {data.map((recentExecution, index) => {
        return (
          <Link
            key={index}
            to={getExperimentRunLink(
              experimentID,
              recentExecution.notifyID,
              recentExecution.workflowRunID,
            )}
            target="_blank"
            underline="none"
            color="inherit"
            style={{
              pointerEvents: hidePopperForStatus(recentExecution.phase)
                ? 'none'
                : 'auto',
            }}
          >
            <StatusCell execution={recentExecution} />
          </Link>
        );
      })}
    </div>
  );
}
