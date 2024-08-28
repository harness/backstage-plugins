import React from 'react';
import {
  Card,
  CardContent,
  CircularProgress,
  makeStyles,
  Typography,
} from '@material-ui/core';
import ArrowDropDownOutlinedIcon from '@mui/icons-material/ArrowDropDownOutlined';
import ArrowDropUpOutlinedIcon from '@mui/icons-material/ArrowDropUpOutlined';

const useStyles = makeStyles({
  costCtn: {
    padding: 20,
  },
  costCard: {
    minWidth: 250,
    minHeight: 130,
  },
  costDescription: {
    marginTop: 8,
    marginBottom: 8,
  },
  emptyState: {
    minWidth: 250,
    minHeight: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trendCtn: {
    display: 'flex',
    alignItems: 'center',
    paddingRight: 4,
  },
});

interface CostCardProps {
  isLoading: boolean;
  statsLabel: string;
  statsValue: string;
  statsDescription: string;
  statsTrend?: number;
}

const CostCard: React.FC<CostCardProps> = ({
  isLoading,
  statsDescription,
  statsLabel,
  statsValue,
  statsTrend,
}) => {
  const classes = useStyles();

  if (isLoading) {
    return (
      <Card className={classes.emptyState}>
        <CircularProgress />
      </Card>
    );
  }

  if (!statsValue) {
    return <></>;
  }

  return (
    <Card className={classes.costCard}>
      <CardContent className={classes.cardContent}>
        <div>
          <Typography variant="body2">{statsLabel}</Typography>
          <Typography variant="h3" className={classes.costDescription}>
            {statsValue}
          </Typography>
          <Typography variant="body2">{statsDescription}</Typography>
        </div>
        {statsTrend ? (
          <div
            style={{ color: statsTrend >= 0 ? '#4dc952' : '#e43326' }}
            className={classes.trendCtn}
          >
            {statsTrend >= 0 ? (
              <ArrowDropDownOutlinedIcon style={{ color: '#4dc952' }} />
            ) : (
              <ArrowDropUpOutlinedIcon style={{ color: '#e43326' }} />
            )}
            {statsTrend < 0 ? statsTrend * -1 : statsTrend}%
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default CostCard;
