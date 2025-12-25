import React, { useState, useMemo } from 'react';
import { Drawer, Typography, Divider } from '@material-ui/core';
import { ResourceDetailDrawerProps } from './types';
import { useStyles } from './styles';
import { filterAttributes } from './utils';
import { getDriftIcon } from './DriftIcon';
import Header from './Header';
import SubHeader from './SubHeader';
import SearchField from './SearchField';
import AttributeList from './AttributeList';

const ResourceDetailDrawer: React.FC<ResourceDetailDrawerProps> = ({
  open,
  onClose,
  width = 1000,
  resource,
  title = '',
}) => {
  const classes = useStyles();
  const [searchValue, setSearchValue] = useState('');

  const driftStatus = resource?.drift_status;
  const driftAttributes = useMemo(
    () => resource?.drift_attributes || {},
    [resource]
  );
  const isDeleted = driftStatus === 'deleted';
  const allDeleted = isDeleted && Object.keys(driftAttributes).length > 0;
  const headerIcon = driftStatus ? getDriftIcon(driftStatus) : null;

  const filteredAttributes = useMemo(
    () => filterAttributes(resource?.attributes, driftAttributes, searchValue),
    [resource?.attributes, searchValue, driftAttributes]
  );

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <div className={classes.drawerContent} style={{ width }}>
        <Header title={title} icon={headerIcon} onClose={onClose} />
        <SubHeader 
          name={resource?.name}
          provider={resource?.provider}
          module={resource?.module}
        />
        <Divider className={classes.divider} />
        
        {/* Body */}
        <div className={classes.drawerBody}>
          {resource && (
            <>
              {/* Search Input - Sticky */}
              <SearchField value={searchValue} onChange={setSearchValue} />

              {/* VALUE Header */}
              <Typography className={classes.valueHeader}>VALUE</Typography>

              {/* Attributes List */}
              <AttributeList
                attributes={filteredAttributes}
                driftStatus={driftStatus}
                isDeleted={isDeleted}
                allDeleted={allDeleted}
              />
            </>
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default ResourceDetailDrawer;

