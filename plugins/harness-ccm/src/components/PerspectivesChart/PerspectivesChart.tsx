import { makeStyles } from '@material-ui/core';
import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import useFetchPerspectiveDetailsSummaryWithBudget from '../../api/useFetchPerspectiveDetailsSummaryWithBudget';
import { discoveryApiRef, useApi } from '@backstage/core-plugin-api';
import { getIdentifiersFromUrl } from '@harnessio/backstage-plugin-harness-chaos/src/utils/getIdentifiersFromUrl';
import { useResourceSlugFromEntity } from '../../hooks/useResourceSlugFromEntity';

import { PerspectiveChartMock } from '../../Mocks';

const useStyles = makeStyles({
  chartCtn: {
    padding: 24,
  },
});

export const CE_COLOR_CONST_NEW = [
  '#0092E4', // Primary 6
  '#4947DD', // Blue 700
  '#42AB45', // Green 600
  '#FF832B', // Orange 500
  '#24807F', // Cloud Cost Management 300
  '#7D4DD3', // Purple 500
  '#FCC026', // Yellow 800
  '#EE5F54', // Red 400
  '#EE2A89', // Magenta 700
  '#954E02', // Brown
  '#0BC8D6', // Teal 500,
  '#7FB800', // Lime 500
];

const PerspectivesChart = () => {
  const classes = useStyles();

  const formattedData =
    PerspectiveChartMock.data.perspectiveTimeSeriesStats.stats.map(stat => {
      const time = new Date(stat.time).toISOString().split('T')[0];
      const values = stat.values.reduce((acc, curr) => {
        acc[curr.key.name] = curr.value;
        return acc;
      }, {});

      return { date: time, ...values };
    });

  const keys = Object.keys(formattedData[0]).filter(key => key !== 'date');

  return (
    <div className={classes.chartCtn}>
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          width={500}
          height={300}
          data={formattedData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={value => `$${value.toLocaleString()}`} />
          <Tooltip formatter={value => `$${value.toLocaleString()}`} />
          <Legend />
          {keys.map((key, idx) => (
            <Bar
              stackId="a"
              key={key}
              dataKey={key}
              fill={
                key === 'Others'
                  ? '#dae0ff'
                  : CE_COLOR_CONST_NEW[idx % CE_COLOR_CONST_NEW.length]
              }
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerspectivesChart;
