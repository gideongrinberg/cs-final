
import React, { useState } from 'react';
import { 
  ComposedChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Bar,
  ReferenceLine
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getPriceHistory } from '@/services/stockService';
import { formatCurrency } from '@/utils/stockUtils';
import { ArrowRight } from 'lucide-react';

interface StockChartProps {
  ticker: string;
  stockName: string;
  currentPrice: number;
  change: number;
  percentChange: number;
}

// Chart types that can be selected
type ChartType = 'area' | 'candle';

// Available time frames
type TimeFrame = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y';

// Available data resolutions
type Resolution = '1m' | '5m' | '15m' | '30m' | '1h' | '1d';

const StockChart: React.FC<StockChartProps> = ({ 
  ticker, 
  stockName, 
  currentPrice, 
  change, 
  percentChange 
}) => {
  const [timeframe, setTimeframe] = useState<TimeFrame>('1D');
  const [chartType, setChartType] = useState<ChartType>('candle');
  const [resolution, setResolution] = useState<Resolution>('5m');
  const [data, setData] = useState(() => getPriceHistory(ticker, '1D', '5m'));

  // Handle timeframe change
  const handleTimeframeChange = (newTimeframe: TimeFrame) => {
    setTimeframe(newTimeframe);
    
    // Adjust resolution based on timeframe to avoid too many data points
    let newResolution = resolution;
    if (newTimeframe === '1D') {
      newResolution = resolution === '1d' ? '5m' : resolution;
    } else if (newTimeframe === '1W') {
      newResolution = resolution === '1m' ? '15m' : resolution;
    } else if (newTimeframe === '1M' || newTimeframe === '3M') {
      newResolution = resolution === '1m' || resolution === '5m' ? '1h' : resolution;
    } else {
      newResolution = '1d';
    }
    
    setResolution(newResolution);
    setData(getPriceHistory(ticker, newTimeframe, newResolution));
  };

  // Handle resolution change
  const handleResolutionChange = (newResolution: Resolution) => {
    setResolution(newResolution);
    setData(getPriceHistory(ticker, timeframe, newResolution));
  };

  // Handle chart type change
  const handleChartTypeChange = (newType: ChartType) => {
    setChartType(newType);
  };
  
  const formatDate = (date: Date): string => {
    if (timeframe === '1D') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (timeframe === '1W') {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit' });
    } else if (timeframe === '1M' || timeframe === '3M') {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
    }
  };

  // Determine if a candle is bullish (close > open) or bearish (close < open)
  const isBullish = (item: any) => item.close >= item.open;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-background p-3 rounded-md border shadow-md">
          <p className="text-sm font-medium">{formatDate(new Date(label))}</p>
          {chartType === 'candle' ? (
            <div className="grid gap-1 mt-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">Open:</span>
                <span className="text-xs font-medium">{formatCurrency(dataPoint.open)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">High:</span>
                <span className="text-xs font-medium">{formatCurrency(dataPoint.high)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">Low:</span>
                <span className="text-xs font-medium">{formatCurrency(dataPoint.low)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">Close:</span>
                <span className="text-xs font-medium">{formatCurrency(dataPoint.close)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">Volume:</span>
                <span className="text-xs font-medium">{dataPoint.volume?.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <p className="text-lg font-bold">{formatCurrency(dataPoint.price || dataPoint.close)}</p>
          )}
        </div>
      );
    }
    return null;
  };

  const isPositive = percentChange >= 0;
  const fillColor = isPositive ? "rgb(16, 185, 129)" : "rgb(239, 68, 68)";
  const fillColorTransparent = isPositive ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)";

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
              {isPositive ? '+' : ''}{formatCurrency(change)} ({percentChange}%)
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex gap-1">
            <Button
              variant={chartType === 'area' ? "default" : "outline"}
              size="sm"
              onClick={() => handleChartTypeChange('area')}
              className="px-3"
            >
              Area
            </Button>
            <Button
              variant={chartType === 'candle' ? "default" : "outline"}
              size="sm"
              onClick={() => handleChartTypeChange('candle')}
              className="px-3"
            >
              Candle
            </Button>
          </div>
          
          <div className="ml-auto">
            <Select value={resolution} onValueChange={(val) => handleResolutionChange(val as Resolution)}>
              <SelectTrigger className="w-[90px] h-8">
                <SelectValue placeholder="Resolution" />
              </SelectTrigger>
              <SelectContent>
                {timeframe === '1D' && (
                  <>
                    <SelectItem value="1m">1m</SelectItem>
                    <SelectItem value="5m">5m</SelectItem>
                    <SelectItem value="15m">15m</SelectItem>
                    <SelectItem value="30m">30m</SelectItem>
                  </>
                )}
                {(timeframe === '1W' || timeframe === '1M') && (
                  <>
                    <SelectItem value="15m">15m</SelectItem>
                    <SelectItem value="30m">30m</SelectItem>
                    <SelectItem value="1h">1h</SelectItem>
                  </>
                )}
                {(timeframe === '3M' || timeframe === '1Y' || timeframe === '5Y') && (
                  <>
                    <SelectItem value="1h">1h</SelectItem>
                    <SelectItem value="1d">1d</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="h-[300px] w-full price-chart-area">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <ComposedChart
                data={data.map(d => ({ 
                  date: d.date.toISOString(), 
                  price: d.close || d.price, 
                  volume: d.volume 
                }))}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
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
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke={fillColor} 
                  fillOpacity={1}
                  fill={`url(#colorPrice-${ticker})`} 
                />
                <ReferenceLine y={currentPrice} stroke="#888" strokeDasharray="3 3" />
              </ComposedChart>
            ) : (
              <ComposedChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
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
                
                {/* High-Low line */}
                <Bar
                  dataKey="high_low_line"
                  fill="transparent"
                  stroke="#8884d8"
                  barSize={2}
                  yAxisId={0}
                  stackId="stack"
                  legendType="none"
                >
                  {data.map((entry, index) => (
                    <Bar 
                      key={`${index}-high-low`}
                      dataKey="high_low_line" 
                      y={entry.low} 
                      height={entry.high - entry.low} 
                      fill="transparent" 
                      stroke={isBullish(entry) ? "rgb(16, 185, 129)" : "rgb(239, 68, 68)"}
                    />
                  ))}
                </Bar>
                
                {/* Open-Close body */}
                <Bar
                  dataKey="candle_body"
                  yAxisId={0}
                  barSize={8}
                  stackId="stack"
                  legendType="none"
                >
                  {data.map((entry, index) => (
                    <Bar 
                      key={`${index}-candle`}
                      dataKey="candle_body" 
                      y={Math.min(entry.open, entry.close)} 
                      height={Math.abs(entry.close - entry.open)} 
                      fill={isBullish(entry) ? "rgb(16, 185, 129)" : "rgb(239, 68, 68)"}
                    />
                  ))}
                </Bar>
                
                <ReferenceLine y={currentPrice} stroke="#888" strokeDasharray="3 3" />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
        
        <div className="flex justify-center gap-2 mt-4">
          {(['1D', '1W', '1M', '3M', '1Y', '5Y'] as TimeFrame[]).map((tf) => (
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
      </CardContent>
    </Card>
  );
};

export default StockChart;
