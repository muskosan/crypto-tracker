import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface CoinChartProps {
  chartData: any[];
  isPositive: boolean;
  chartPeriod: string;
}

export function CoinChart({ chartData, isPositive, chartPeriod }: CoinChartProps) {
  // Calculate Y-axis domain with +/- 20% padding
  const calculateYDomain = () => {
    if (chartData.length === 0) return ['auto', 'auto'];
    
    const prices = chartData.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice;
    const padding = range * 0.2; // 20% padding
    
    return [
      Math.max(0, minPrice - padding), // Don't go below 0
      maxPrice + padding
    ];
  };

  // Format X-axis labels based on chart period
  const formatXAxisLabel = (tickItem: any) => {
    // tickItem is the actual timestamp value from the data
    const date = new Date(tickItem);
    
    switch (chartPeriod) {
      case '1': // 24 hours
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      case '7': // 7 days
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      case '30': // 30 days
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      case '365': // 1 year
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          year: '2-digit' 
        });
      default:
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
    }
  };

  // Format Y-axis labels (price)
  const formatYAxisLabel = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    } else if (value >= 1) {
      return `$${value.toFixed(2)}`;
    } else {
      return `$${value.toFixed(4)}`;
    }
  };

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const date = new Date(label); // label is the timestamp
      
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm text-muted-foreground">
            {chartPeriod === '1' 
              ? date.toLocaleString('en-US', { 
                  weekday: 'short',
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : date.toLocaleDateString('en-US', { 
                  weekday: 'short',
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })
            }
          </p>
          <p className="text-lg font-semibold" style={{ color: data.color }}>
            {formatYAxisLabel(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="hsl(var(--border))" 
            opacity={0.3}
          />
          <XAxis
            dataKey="time"
            tickFormatter={formatXAxisLabel}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            interval={Math.floor(chartData.length / 6)} // Show approximately 6-7 labels
          />
          <YAxis
            domain={calculateYDomain()}
            tickFormatter={formatYAxisLabel}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="price"
            stroke={isPositive ? '#22c55e' : '#f87171'}
            strokeWidth={2}
            dot={false}
            activeDot={{ 
              r: 4, 
              stroke: isPositive ? '#22c55e' : '#f87171',
              strokeWidth: 2,
              fill: 'hsl(var(--background))'
            }}
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