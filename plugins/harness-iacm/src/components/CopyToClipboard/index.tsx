import React, { FC } from 'react';
import { Button, makeStyles } from '@material-ui/core';
import CopyIcon from '@material-ui/icons/FileCopyOutlined';

interface Props {
  copyValue?: string;
}

const useStyles = makeStyles(theme => ({
  iconButton: {
    color: '#0A6EBE',
    width: 15,
    height: 15,
  },
}));

const CopyToClipboard: FC<Props> = ({ copyValue }) => {
  const classes = useStyles();

  const copy = (content?: string) => async () => {
    try {
      await navigator.clipboard.writeText(content || '');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  return (
    <Button onClick={copy(copyValue)} variant="text">
      <CopyIcon className={classes.iconButton} />
    </Button>
  );
};

export default CopyToClipboard;
