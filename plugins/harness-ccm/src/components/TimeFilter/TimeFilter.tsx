import React, { useEffect, useState } from 'react';
import {
  Button,
  CircularProgress,
  Divider,
  makeStyles,
  Menu,
  MenuItem,
  Typography,
} from '@material-ui/core';

import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';

import {
  CALENDAR_MONTH_DATES,
  CE_DATE_FORMAT_INTERNAL,
  DATE_RANGE_SHORTCUTS,
  DATE_RANGE_SHORTCUTS_NAME,
  DateLabelToDisplayTextMap,
  RECOMMENDED_DATES,
  RELATIVE_DATES,
  TimeRangeFilterType,
} from '../../utils/PerpsectiveUtils';
import { Dayjs } from 'dayjs';

const useStyles = makeStyles({
  subHeader: {
    padding: '8px 16px',
  },
  dateCtn: {
    justifyContent: 'space-between',
    gap: 20,
  },
  dateRange: {
    color: '#b0b1c4',
  },
  divider: {
    margin: '8px 0px',
  },
  buttonCtn: {
    height: 36,
  },
});

const DateRenderer = ({
  date,
  setTimeRange,
  setTimeLabel,
  handleClose,
}: {
  date: {
    label: DATE_RANGE_SHORTCUTS_NAME;
    dateRange: Dayjs[];
    dateFormat: string[];
  };
  setTimeRange: (newValue: TimeRangeFilterType) => void;
  setTimeLabel: (newValue: DATE_RANGE_SHORTCUTS_NAME) => void;
  handleClose: () => void;
}) => {
  const classes = useStyles();

  return (
    <MenuItem
      className={classes.dateCtn}
      onClick={() => {
        setTimeRange({
          from: date.dateRange[0].format(CE_DATE_FORMAT_INTERNAL),
          to: date.dateRange[1].format(CE_DATE_FORMAT_INTERNAL),
        });
        setTimeLabel(date.label);
        handleClose();
      }}
    >
      <span>{DateLabelToDisplayTextMap[date.label]}</span>
      <span>
        <Typography variant="body2" className={classes.dateRange}>
          {`${date.dateRange[0].format(date.dateFormat[0])} ${
            date.dateFormat[1]
              ? `- ${date.dateRange[1].format(date.dateFormat[1])}`
              : ''
          }`}
        </Typography>
      </span>
    </MenuItem>
  );
};

interface TimeFilterProps {
  isLoading?: boolean;
  timeRange: TimeRangeFilterType;
  setTimeRange: (newValue: TimeRangeFilterType) => void;
}

const TimeFilter: React.FC<TimeFilterProps> = ({
  isLoading,
  timeRange,
  setTimeRange,
}) => {
  const classes = useStyles();

  const [timeLabel, setTimeLabel] = useState<string>(
    DATE_RANGE_SHORTCUTS_NAME.LAST_30_DAYS,
  );

  useEffect(() => {
    if (!isLoading) {
      const filteredArray = Object.keys(DATE_RANGE_SHORTCUTS).filter(short => {
        const date = DATE_RANGE_SHORTCUTS[short];

        return (
          timeRange.from === date[0].format(CE_DATE_FORMAT_INTERNAL) &&
          timeRange.to === date[1].format(CE_DATE_FORMAT_INTERNAL)
        );
      });

      if (filteredArray.length) {
        setTimeLabel(filteredArray[0]);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        endIcon={<KeyboardArrowDown />}
        className={classes.buttonCtn}
      >
        {isLoading ? (
          <CircularProgress size={12} />
        ) : (
          DateLabelToDisplayTextMap[timeLabel]
        )}
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <Typography variant="subtitle2" className={classes.subHeader}>
          Recommended
        </Typography>
        {RECOMMENDED_DATES.map(date => (
          <DateRenderer
            date={date}
            setTimeRange={setTimeRange}
            setTimeLabel={setTimeLabel}
            handleClose={handleClose}
          />
        ))}
        <Divider className={classes.divider} />
        <Typography variant="subtitle2" className={classes.subHeader}>
          Relative
        </Typography>
        {RELATIVE_DATES.map(date => (
          <DateRenderer
            date={date}
            setTimeRange={setTimeRange}
            setTimeLabel={setTimeLabel}
            handleClose={handleClose}
          />
        ))}
        <Divider className={classes.divider} />
        <Typography variant="subtitle2" className={classes.subHeader}>
          Calendar Months
        </Typography>
        {CALENDAR_MONTH_DATES.map(date => (
          <DateRenderer
            date={date}
            setTimeRange={setTimeRange}
            setTimeLabel={setTimeLabel}
            handleClose={handleClose}
          />
        ))}
      </Menu>
    </div>
  );
};

export default TimeFilter;
