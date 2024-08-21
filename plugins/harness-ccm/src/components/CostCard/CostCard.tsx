import React from 'react';
import { Card, CardContent, makeStyles, Typography } from '@material-ui/core';

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
});

interface CostCardProps {
  statsLabel: string;
  statsValue: string;
  statsDescription: string;
}

const CostCard: React.FC<CostCardProps> = ({
  statsDescription,
  statsLabel,
  statsValue,
}) => {
  const classes = useStyles();

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
