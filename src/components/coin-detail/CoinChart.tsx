import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface CoinChartProps {
  chartData: any[];
  isPositive: boolean;
  chartPeriod: string;
}

export function CoinChart({ chartData, isPositive, chartPeriod }: CoinChartProps) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="price"
            stroke={isPositive ? '#22c55e' : '#f87171'}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
      {chartData.length > 0 && (
        <div className="mt-2 text-xs text-muted-foreground text-center">
          Showing {chartPeriod === '1' ? '24H' : `${chartPeriod}D`} price history
        </div>
      )}
    </div>
  );
}