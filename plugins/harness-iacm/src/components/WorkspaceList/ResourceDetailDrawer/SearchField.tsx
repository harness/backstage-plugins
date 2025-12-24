import React from 'react';
import { TextField, InputAdornment, Box, IconButton } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import CloseIcon from '@material-ui/icons/Close';
import { useStyles } from './styles';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  sticky?: boolean;
}

const SearchField: React.FC<SearchFieldProps> = ({ value, onChange }) => {
  const classes = useStyles();

  const handleClear = () => {
    onChange('');
  };

    return (
      <Box className={classes.searchFieldSticky}>
        <TextField
          placeholder="Search"
          variant="outlined"
          size="small"
          fullWidth
          value={value}
          onChange={(e) => onChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: value && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleClear}
                  aria-label="clear search"
                  edge="end"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    );
  
};

export default SearchField;