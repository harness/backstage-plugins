import React, { useState } from 'react';
import {
  EmptyState,
  ErrorPanel,
  Link,
  Table,
  TableColumn,
} from '@backstage/core-components';

import { PerspectiveGridMock } from '../../Mocks';

const columns: TableColumn[] = [
  {
    title: 'Name',
    field: 'name',
    highlight: true,
  },
  {
    title: 'Cost',
    field: 'cost',
  },
  {
    title: 'Cost Trend',
    field: 'costTrend',
  },
];

const PerspectivesGrid = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  return (
    <div>
      <Table
        onPageChange={() => {}}
        columns={columns}
        data={PerspectiveGridMock.data.perspectiveGrid.data}
        totalCount={PerspectiveGridMock.data.perspectiveTotalCount}
        options={{
          search: false,
          paging: true,
          emptyRowsWhenPaging: false,
          pageSize: pageSize,
          pageSizeOptions: [5, 10, 25],
        }}
      />
    </div>
  );
};

export default PerspectivesGrid;
