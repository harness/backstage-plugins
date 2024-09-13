import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { CircularProgress, makeStyles } from '@material-ui/core';
import { TimeSeriesDataPoints, ViewVisualization } from '../../api/types';

const useStyles = makeStyles({
  chartCtn: {
    padding: 24,
  },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const CE_COLOR_CONST_NEW = [
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

const OTHERS_COLOR_HEX = '#dae0ff';

const tickFormatter = (value: any) => `$${value.toLocaleString()}`;

interface PerspectivesChartProps {
  isLoading?: boolean;
  data: TimeSeriesDataPoints[];
  viewVisualization: ViewVisualization['chartType'];
}

const PerspectivesChart: React.FC<PerspectivesChartProps> = ({
  isLoading,
  data,
  viewVisualization,
}) => {
  const classes = useStyles();

  const formattedData = data?.map(stat => {
    const time = new Date(stat.time).toISOString().split('T')[0];
    const values = stat.values.reduce((acc, curr) => {
      (acc as any)[curr?.key.name || ''] = curr?.value;
      return acc;
    }, {});

    return { date: time, ...values };
  });

  const keys = Object.keys(formattedData[0] || {}).filter(
    key => key !== 'date',
  );

  if (isLoading) {
    return (
      <ResponsiveContainer
        width="100%"
        height={500}
        className={classes.emptyState}
      >
        <CircularProgress />
      </ResponsiveContainer>
    );
  }

  return (
    <div className={classes.chartCtn}>
      <ResponsiveContainer width="100%" height={500}>
        {viewVisualization === 'STACKED_TIME_SERIES' ? (
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
            <XAxis dataKey="date" />
            <YAxis tickFormatter={tickFormatter} />
            <Tooltip formatter={tickFormatter} />
            <Legend />
            {keys.map((key, idx) => (
              <Bar
                stackId="a"
                key={key}
                dataKey={key}
                fill={
                  key === 'Others'
                    ? OTHERS_COLOR_HEX
                    : CE_COLOR_CONST_NEW[idx % CE_COLOR_CONST_NEW.length]
                }
              />
            ))}
          </BarChart>
        ) : (
          <AreaChart
            width={730}
            height={250}
            data={formattedData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={tickFormatter} />
            <Tooltip formatter={tickFormatter} />
            <Legend />
            {keys.map((key, idx) => (
              <Area
                type="monotone"
                key={key}
                dataKey={key}
                fill={
                  key === 'Others'
                    ? OTHERS_COLOR_HEX
                    : CE_COLOR_CONST_NEW[idx % CE_COLOR_CONST_NEW.length]
                }
              />
            ))}
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default PerspectivesChart;
