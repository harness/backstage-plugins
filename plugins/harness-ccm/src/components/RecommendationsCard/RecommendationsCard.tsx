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
    minWidth: 275,
    minHeight: 130,
  },
  emptyState: {
    minWidth: 275,
    minHeight: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

interface RecommendationsCardProps {
  isLoading: boolean;
  totalSavings: number;
  recommendationsCount: number;
}

const RecommendationsCard: React.FC<RecommendationsCardProps> = ({
  isLoading,
  totalSavings,
  recommendationsCount,
}) => {
  const classes = useStyles();

  if (isLoading) {
    return (
      <Card className={classes.emptyState}>
        <CircularProgress />
      </Card>
    );
  }

  if (!totalSavings) {
    return <></>;
  }

  return (
    <Card className={classes.costCard}>
      <CardContent>
        <Typography variant="body2">Recommendations</Typography>
        <Typography variant="caption">
          {recommendationsCount} recommendation(s) saving upto
        </Typography>
        <Typography variant="h5">{`$${totalSavings.toLocaleString()}`}</Typography>
        <Typography variant="body2">per month</Typography>
      </CardContent>
    </Card>
  );
};

export default RecommendationsCard;
