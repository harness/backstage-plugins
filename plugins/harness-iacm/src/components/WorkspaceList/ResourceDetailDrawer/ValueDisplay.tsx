import React from 'react';
import { Typography, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { isValueUnknown, formatValue } from './utils';
import CopyToClipboard from '../../CopyToClipboard';

const useStyles = makeStyles(theme => ({
  jsonValue: {
    fontSize: '0.875rem',
    padding: theme.spacing(1),
    borderRadius: 4,
    overflow: 'auto',
    marginTop: theme.spacing(0.5),
    border: '1px solid #e0e0e0',
    fontFamily: 'inherit',
  },
  attributeValue: {
    fontSize: '1rem',
    fontWeight: 400,
    color: '#212121',
    flex: 1,
    wordBreak: 'break-word',
    fontFamily: 'inherit',
  },
  valueLabel: {
    fontWeight: 600,
    fontSize: '0.875rem',
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
    border: '1px solid #e0e0e0',
    fontFamily: 'inherit',
  },
}));

interface ValueDisplayProps {
  value: any;
  isDrift?: boolean;
  showCopy?: boolean;
  label?: string;
  copyTopOffset?: string;
}

export const formatValueDisplay = (
  value: any,
  isDrift: boolean = false,
  classes: any,
): React.ReactNode => {
  if (isValueUnknown(value)) {
    return (
      <span
        style={{ fontStyle: 'italic', color: '#999', fontFamily: 'inherit' }}
      >
        Unknown
      </span>
    );
  }
  if (typeof value === 'object') {
    return (
      <pre
        className={classes.jsonValue}
        style={{ backgroundColor: isDrift ? '' : '#F3F3FA' }}
      >
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }
  return (
    <div
      className={classes.stringValue}
      style={{ backgroundColor: isDrift ? '' : '#F3F3FA' }}
    >
      {String(value)}
    </div>
  );
};

const ValueDisplay: React.FC<ValueDisplayProps> = ({
  value,
  isDrift = false,
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
      {formatValueDisplay(value, isDrift, classes)}
    </Box>
  );
};

export default ValueDisplay;
