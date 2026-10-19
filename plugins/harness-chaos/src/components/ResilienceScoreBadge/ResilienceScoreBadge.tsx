import React from 'react';
import { CircularProgress, Typography, makeStyles } from '@material-ui/core';

import { getResilienceScoreColor } from '../../utils/tableUtils';
import { ResilienceSummary } from '../../api/useAverageResilienceScore';

const RING_SIZE = 72;

const useStyles = makeStyles(theme => ({
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(1, 2),
    borderRadius: 8,
  },
  ring: {
    position: 'relative',
    display: 'inline-flex',
    width: RING_SIZE,
    height: RING_SIZE,
  },
  track: {
    position: 'absolute',
    inset: 0,
    color: theme.palette.type === 'dark' ? '#4a4a4a' : '#d9dae5',
  },
  ringLabel: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1.1,
  },
  score: {
    fontWeight: 700,
    fontSize: '0.9rem',
  },
  count: {
    fontSize: '0.7rem',
    color: theme.palette.text.secondary,
  },
  label: {
    fontWeight: 600,
  },
}));

interface ResilienceScoreBadgeProps {
  summary: ResilienceSummary | undefined;
  error?: Error;
  loading: boolean;
}

export const ResilienceScoreBadge = ({
  summary,
  error,
  loading,
}: ResilienceScoreBadgeProps) => {
  const classes = useStyles();

  const average = summary?.average;
  const color = getResilienceScoreColor(average);

  return (
    <>
      {error ? (
        <Typography variant="body2" color="error" component="span">
          {error.message}
        </Typography>
      ) : (
        <div
          className={classes.badge}
          style={{ backgroundColor: `${color}22` }}
        >
          <div className={classes.ring}>
            <CircularProgress
              className={classes.track}
              variant="determinate"
              value={100}
              size={RING_SIZE}
              thickness={4}
            />
            {loading ? (
              <CircularProgress
                size={RING_SIZE}
                thickness={4}
                style={{ color }}
              />
            ) : (
              <CircularProgress
                variant="determinate"
                value={average ?? 0}
                size={RING_SIZE}
                thickness={4}
                style={{ color }}
              />
            )}
            <div className={classes.ringLabel}>
              {!loading && (
                <>
                  <span className={classes.score}>
                    {average === undefined ? 'N/A' : `${Math.round(average)}%`}
                  </span>
                  <span className={classes.count}>
                    {summary?.scored ?? 0}/{summary?.total ?? 0}
                  </span>
                </>
              )}
            </div>
          </div>
          <Typography variant="subtitle1" className={classes.label}>
            Resilience score
          </Typography>
        </div>
      )}
    </>
  );
};
