import React from 'react';
import { Typography, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { isValueUnknown, formatValue } from './utils';
import CopyToClipboard from '../../CopyToClipboard';

const useStyles = makeStyles(theme => ({
  jsonValue: {
    padding: theme.spacing(1),
    borderRadius: 4,
    overflow: 'auto',
    marginTop: theme.spacing(0.5),
    border: `1px solid ${theme.palette.divider}`,
    fontFamily: 'inherit',
    backgroundColor:
      theme.palette.type === 'dark'
        ? theme.palette.background.default
        : '#F3F3FA',
  },
  attributeValue: {
    fontSize: '1rem',
    fontWeight: 400,
    color: theme.palette.text.primary,
    flex: 1,
    wordBreak: 'break-word',
    fontFamily: 'inherit',
  },
  valueLabel: {
    fontWeight: 600,
    marginRight: theme.spacing(1),
    color: theme.palette.text.primary,
  },
  copyButtonWrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
  },
  stringValue: {
    padding: '8px',
    borderRadius: 4,
    border: `1px solid ${theme.palette.divider}`,
    fontFamily: 'inherit',
    backgroundColor:
      theme.palette.type === 'dark'
        ? theme.palette.background.default
        : '#F3F3FA',
  },
}));

interface ValueDisplayProps {
  value: any;
  showCopy?: boolean;
  label?: string;
  copyTopOffset?: string;
}

export const formatValueDisplay = (
  value: any,
  classes: any,
): React.ReactNode => {
  if (typeof value === 'object') {
    return (
      <pre className={classes.jsonValue}>{JSON.stringify(value, null, 2)}</pre>
    );
  }
  return (
    <div className={classes.stringValue}>
      {isValueUnknown(value) ? 'Unknown' : String(value)}
    </div>
  );
};

const ValueDisplay: React.FC<ValueDisplayProps> = ({
  value,
  showCopy = true,
  label,
  copyTopOffset,
}) => {
  const classes = useStyles();

  return (
    <Box style={{ position: 'relative', width: '100%' }}>
      {showCopy && !isValueUnknown(value) && (
        <Box
          className={classes.copyButtonWrapper}
          style={copyTopOffset ? { top: copyTopOffset } : {}}
        >
          <CopyToClipboard copyValue={formatValue(value)} />
        </Box>
      )}
      {label && <Typography className={classes.valueLabel}>{label}</Typography>}
      {formatValueDisplay(value, classes)}
    </Box>
  );
};

export default ValueDisplay;
