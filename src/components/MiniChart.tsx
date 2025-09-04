import { LineChart, Line, ResponsiveContainer } from "recharts";

interface MiniChartProps {
  data: number[];
  isPositive: boolean;
}

export function MiniChart({ data, isPositive }: MiniChartProps) {
  const chartData = data.map((value, index) => ({
    index,
    value,
  }));

  return (
    <div className="w-20 h-12">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={isPositive ? "hsl(var(--success))" : "hsl(var(--error))"}
            strokeWidth={2}
            dot={false}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}