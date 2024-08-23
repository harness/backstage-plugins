import React from 'react';
import { Table, TableColumn } from '@backstage/core-components';

import { QlceViewEntityStatsDataPoint } from '../../api/types';

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

interface PerspectivesGrid {
  isLoading: boolean;
  data: QlceViewEntityStatsDataPoint[];
  totalCount: number;
  page: number;
  handlePageChange: (page: number, pageSize: number) => void;
}

const PerspectivesGrid: React.FC<PerspectivesGrid> = ({
  isLoading,
  data,
  page,
  totalCount,
  handlePageChange,
}) => {
  return (
    <div>
      <Table
        isLoading={isLoading}
        columns={columns}
        data={data}
        totalCount={
          page * 15 < totalCount ? Number.MAX_VALUE : Number.MAX_SAFE_INTEGER
        }
        options={{
          search: false,
          paging: true,
          emptyRowsWhenPaging: false,
          paginationPosition: 'both',
          showFirstLastPageButtons: false,
          pageSize: Number.MAX_SAFE_INTEGER,
          pageSizeOptions: [],
        }}
        page={page > 0 ? 1 : 0}
        onPageChange={handlePageChange}
        localization={{
          pagination: {
            labelDisplayedRows: `(${page * 15 + 1} - ${
              (page + 1) * 15
            }) of ${totalCount}`,
          },
        }}
      />
    </div>
  );
};

export default PerspectivesGrid;
