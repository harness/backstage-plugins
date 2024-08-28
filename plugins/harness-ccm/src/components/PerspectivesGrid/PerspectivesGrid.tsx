import React from 'react';
import { Typography } from '@material-ui/core';
import { Table, TableColumn } from '@backstage/core-components';

import ArrowDownwardOutlinedIcon from '@mui/icons-material/ArrowDownwardOutlined';
import ArrowUpwardOutlinedIcon from '@mui/icons-material/ArrowUpwardOutlined';

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
    render: (rowData: any) => (
      <Typography>
        {new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(rowData.cost)}
      </Typography>
    ),
  },
  {
    title: 'Cost Trend',
    field: 'costTrend',
    render: (rowData: any) => (
      <Typography>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {rowData.costTrend >= 0 ? (
            <ArrowDownwardOutlinedIcon style={{ color: '#4dc952' }} />
          ) : (
            <ArrowUpwardOutlinedIcon style={{ color: '#e43326' }} />
          )}
          {rowData.costTrend < 0 ? rowData.costTrend * -1 : rowData.costTrend}%
        </div>
      </Typography>
    ),
  },
];

interface PerspectivesGridProps {
  isLoading: boolean;
  data: QlceViewEntityStatsDataPoint[];
  totalCount: number;
  page: number;
  handlePageChange: (page: number, pageSize: number) => void;
}

const PerspectivesGrid: React.FC<PerspectivesGridProps> = ({
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
          (page + 1) * 15 < totalCount
            ? Number.MAX_VALUE
            : Number.MAX_SAFE_INTEGER
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
