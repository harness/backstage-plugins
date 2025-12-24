import React from 'react';
import { Typography, Box } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import { useStyles } from './styles';
import { getDriftIcon } from './DriftIcon';
import ValueDisplay from './ValueDisplay';
import { AttributeListProps } from './types';

const AttributeList: React.FC<AttributeListProps> = ({
  attributes,
  driftStatus,
  isDeleted,
  allDeleted,
}) => {
  const classes = useStyles();

  if (attributes.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary">
        No attributes found
      </Typography>
    );
  }

  return (
    <>
      {attributes.map((item, index) => {
        const hasDrift = item.hasDrift ;
        const driftValue = item.driftValue;
        const attributeIcon = hasDrift && driftStatus ? getDriftIcon(driftStatus) : null;

        return (
          <Box
            key={`${item.key}-${index}`}
            className={hasDrift ? `${classes.attributeRow} ${classes.attributeRowDrift}` : classes.attributeRow}
          >
            {/* Key/Label */}
            <Typography component="div" className={classes.attributeKey}>
              {attributeIcon && (
                <span className={classes.iconContainerInline}>
                  {attributeIcon}
                </span>
              )}
              {item.key}
              {(isDeleted || (allDeleted && hasDrift)) && (
                <span className={classes.deletedBadge}>
                  <DeleteIcon style={{ fontSize: 12 }} />
                  DELETED
                </span>
              )}
            </Typography>

            {/* Value with Copy Button */}
            {hasDrift && driftValue ? (
              <Box className={classes.valueComparison}>
                <ValueDisplay
                  value={driftValue}
                  isDrift={true}
                  label="Actual Value:"
                  copyTopOffset="25px"
                />
                <ValueDisplay
                  value={item.value}
                  isDrift={true}
                  label="Expected Value:"
                  copyTopOffset="25px"
                />
              </Box>
            ) : (
              <ValueDisplay value={item.value} />
            )}
          </Box>
        );
      })}
    </>
  );
};

export default AttributeList;

