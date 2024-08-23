import React from 'react';
import {
  Card,
  CardContent,
  CircularProgress,
  makeStyles,
  Typography,
} from '@material-ui/core';

const useStyles = makeStyles({
  costCtn: {
    padding: 20,
  },
  costCard: {
    minWidth: 250,
  },
  costDescription: {
    marginTop: 8,
    marginBottom: 8,
  },
  emptyState: {
    minWidth: 250,
    minHeight: 125,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

interface CostCardProps {
  isLoading: boolean;
  statsLabel: string;
  statsValue: string;
  statsDescription: string;
}

const CostCard: React.FC<CostCardProps> = ({
  isLoading,
  statsDescription,
  statsLabel,
  statsValue,
}) => {
  const classes = useStyles();

  if (isLoading) {
    return (
      <Card className={classes.emptyState}>
        <CircularProgress />
      </Card>
    );
  }

  return (
    <Card className={classes.costCard}>
      <CardContent>
        <Typography variant="body2">{statsLabel}</Typography>
        <Typography variant="h3" className={classes.costDescription}>
          {statsValue}
        </Typography>
        <Typography variant="body2">{statsDescription}</Typography>
      </CardContent>
    </Card>
  );
};

export default CostCard;
