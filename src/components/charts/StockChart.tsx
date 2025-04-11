
import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  TooltipProps,
  Legend
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPriceHistory } from '@/services/stockService';
import { formatCurrency } from '@/utils/stockUtils';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StockChartProps {
  ticker: string;
  stockName: string;
  currentPrice: number;
  change: number;
  percentChange: number;
}

type TimeFrame = '1D' | '1W' | '1M' | '1Y' | '5Y';
type ChartType = 'area' | 'bar';

const StockChart: React.FC<StockChartProps> = ({ 
  ticker, 
  stockName, 
  currentPrice, 
  change, 
  percentChange 
}) => {
  const [timeframe, setTimeframe] = useState<TimeFrame>('1D');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [data, setData] = useState(() => getPriceHistory(ticker, '1D'));

  const handleTimeframeChange = (newTimeframe: TimeFrame) => {
    setTimeframe(newTimeframe);
    setData(getPriceHistory(ticker, newTimeframe));
  };

  const handleChartTypeChange = (value: string) => {
    setChartType(value as ChartType);
  };
  
  const formatDate = (date: Date): string => {
    if (timeframe === '1D') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (timeframe === '1W') {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit' });
    } else if (timeframe === '1M') {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
    }
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-secondary p-3 rounded-md border shadow-md">
          <p className="text-sm font-medium">{formatDate(new Date(label))}</p>
          <p className="text-lg font-bold">{formatCurrency(payload[0].value as number)}</p>
        </div>
      );
    }
    return null;
  };

  const isPositive = percentChange >= 0;
  const fillColor = isPositive ? "rgb(16, 185, 129)" : "rgb(239, 68, 68)";
  const fillColorTransparent = isPositive ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)";
  const barColor = isPositive ? "rgb(16, 185, 129)" : "rgb(239, 68, 68)";

  const renderChart = () => {
    const chartData = data.map(d => ({ date: d.date.toISOString(), price: d.price }));
    
    if (chartType === 'area') {
      return (
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={`colorPrice-${ticker}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={fillColor} stopOpacity={0.8} />
              <stop offset="95%" stopColor={fillColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis 
            dataKey="date" 
            tickFormatter={(date) => formatDate(new Date(date))}
            tick={{ fill: '#8E9196' }}
            tickMargin={10}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            domain={['auto', 'auto']}
            tickFormatter={(value) => formatCurrency(value).replace('.00', '')}
            tick={{ fill: '#8E9196' }}
            orientation="right"
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={fillColor} 
            fillOpacity={1}
            fill={`url(#colorPrice-${ticker})`}
            name="Price"
          />
        </AreaChart>
      );
    } else {
      return (
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis 
            dataKey="date" 
            tickFormatter={(date) => formatDate(new Date(date))}
            tick={{ fill: '#8E9196' }}
            tickMargin={10}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            domain={['auto', 'auto']}
            tickFormatter={(value) => formatCurrency(value).replace('.00', '')}
            tick={{ fill: '#8E9196' }}
            orientation="right"
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="price" 
            fill={barColor}
            name="Price"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      );
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{ticker}</h2>
            <p className="text-sm text-muted-foreground">{stockName}</p>
          </div>
          <div className="mt-2 xs:mt-0">
            <p className="text-xl font-bold">{formatCurrency(currentPrice)}</p>
            <p className={`text-sm ${isPositive ? 'text-success' : 'text-danger'}`}>
              {isPositive ? '+' : ''}{change} ({percentChange}%)
            </p>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-2">
          <div className="flex justify-center gap-2">
            {(['1D', '1W', '1M', '1Y', '5Y'] as TimeFrame[]).map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? "default" : "secondary"}
                size="sm"
                onClick={() => handleTimeframeChange(tf)}
                className="px-3"
              >
                {tf}
              </Button>
            ))}
          </div>
          <div className="w-28">
            <Select value={chartType} onValueChange={handleChartTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="area">Area</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="h-[300px] w-full price-chart-area">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockChart;
