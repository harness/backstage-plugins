import React, { FC } from 'react';
import { Button } from '@material-ui/core';
import CopyIcon from '@material-ui/icons/FileCopyOutlined';

interface Props {
  copyValue?: string;
}
const CopyToClipboard: FC<Props> = ({ copyValue }) => {
  const copy = (content?: string) => async () => {
    try {
      await navigator.clipboard.writeText(content || '');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  return (
    <Button onClick={copy(copyValue)} variant="text">
      <CopyIcon style={{ color: '#0A6EBE', width: '15', height: '15' }} />
    </Button>
  );
};

export default CopyToClipboard;
