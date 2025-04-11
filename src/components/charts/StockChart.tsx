
import React, { useState, useEffect } from 'react';
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
  Legend,
  ReferenceLine
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from 'lucide-react';

interface StockChartProps {
  ticker: string;
  stockName: string;
  currentPrice: number;
  change: number;
  percentChange: number;
}

type TimeFrame = '1D' | '1W' | '1M' | '1Y' | '5Y';
type ChartType = 'area' | 'bar' | 'ohlc';
type Resolution = '1min' | '5min' | '15min' | '30min' | '1hour' | '1day' | '1week';

interface OHLCData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
}

const StockChart: React.FC<StockChartProps> = ({ 
  ticker, 
  stockName, 
  currentPrice, 
  change, 
  percentChange 
}) => {
  const [timeframe, setTimeframe] = useState<TimeFrame>('1D');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [resolution, setResolution] = useState<Resolution>('1min');
  const [data, setData] = useState(() => getPriceHistory(ticker, '1D', '1min'));
  const [ohlcData, setOhlcData] = useState<OHLCData[]>([]);

  // Set appropriate default resolution based on timeframe
  useEffect(() => {
    let defaultResolution: Resolution = '1min';
    
    if (timeframe === '1D') {
      defaultResolution = '1min';
    } else if (timeframe === '1W') {
      defaultResolution = '15min';
    } else if (timeframe === '1M') {
      defaultResolution = '1hour';
    } else if (timeframe === '1Y') {
      defaultResolution = '1day';
    } else if (timeframe === '5Y') {
      defaultResolution = '1week';
    }
    
    setResolution(defaultResolution);
    setData(getPriceHistory(ticker, timeframe, defaultResolution));
  }, [timeframe, ticker]);

  // Generate OHLC data from price data
  useEffect(() => {
    // For OHLC chart, we need to transform the data into open, high, low, close
    if (data.length > 0) {
      // For simplicity, we'll generate synthetic OHLC data from our price data
      const ohlcPoints: OHLCData[] = [];
      
      // For each price point, create an OHLC candle
      for (let i = 0; i < data.length; i++) {
        const currentPrice = data[i].price;
        
        // Calculate synthetic open, high, low values
        const open = i > 0 ? data[i-1].price : currentPrice * (1 - Math.random() * 0.01);
        const variance = currentPrice * 0.01; // 1% variance for high/low
        const high = Math.max(open, currentPrice) + Math.random() * variance;
        const low = Math.min(open, currentPrice) - Math.random() * variance;
        
        ohlcPoints.push({
          date: data[i].date,
          open,
          high,
          low,
          close: currentPrice
        });
      }
      
      setOhlcData(ohlcPoints);
    }
  }, [data]);

  const handleTimeframeChange = (newTimeframe: TimeFrame) => {
    setTimeframe(newTimeframe);
    // Resolution will be updated by the useEffect
  };

  const handleChartTypeChange = (value: string) => {
    setChartType(value as ChartType);
  };
  
  const handleResolutionChange = (value: Resolution) => {
    setResolution(value);
    setData(getPriceHistory(ticker, timeframe, value));
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
      if (chartType === 'ohlc' && payload.length >= 4) {
        return (
          <div className="bg-secondary p-3 rounded-md border shadow-md">
            <p className="text-sm font-medium">{formatDate(new Date(label))}</p>
            <p className="text-sm">Open: {formatCurrency(payload[0].value as number)}</p>
            <p className="text-sm">High: {formatCurrency(payload[1].value as number)}</p>
            <p className="text-sm">Low: {formatCurrency(payload[2].value as number)}</p>
            <p className="text-lg font-bold">Close: {formatCurrency(payload[3].value as number)}</p>
          </div>
        );
      }
      
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

  // Available resolutions based on selected timeframe
  const getAvailableResolutions = (): Resolution[] => {
    switch (timeframe) {
      case '1D':
        return ['1min', '5min', '15min', '30min'];
      case '1W':
        return ['5min', '15min', '30min', '1hour'];
      case '1M':
        return ['15min', '30min', '1hour', '1day'];
      case '1Y':
        return ['1hour', '1day', '1week'];
      case '5Y':
        return ['1day', '1week'];
      default:
        return ['1min', '5min', '15min', '30min', '1hour', '1day', '1week'];
    }
  };

  // Format resolution for display
  const formatResolution = (res: Resolution): string => {
    switch (res) {
      case '1min': return '1 Min';
      case '5min': return '5 Min';
      case '15min': return '15 Min';
      case '30min': return '30 Min';
      case '1hour': return '1 Hour';
      case '1day': return '1 Day';
      case '1week': return '1 Week';
      default: return res;
    }
  };

  const renderChart = () => {
    const chartData = data.map(d => ({ date: d.date.toISOString(), price: d.price }));
    const ohlcChartData = ohlcData.map(d => ({ 
      date: d.date.toISOString(), 
      open: d.open,
      high: d.high, 
      low: d.low,
      close: d.close,
    }));
    
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
    } else if (chartType === 'bar') {
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
    } else {
      // OHLC Chart
      return (
        <BarChart
          data={ohlcChartData}
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
          {/* Render the OHLC price range line for each data point */}
          {ohlcChartData.map((entry, index) => (
            <React.Fragment key={`ohlc-${index}`}>
              {/* Vertical line from low to high */}
              <ReferenceLine
                segment={[
                  { x: entry.date, y: entry.low },
                  { x: entry.date, y: entry.high }
                ]}
                stroke="#8884d8"
                strokeWidth={1}
                ifOverflow="extendDomain"
              />
              {/* Horizontal line at open price */}
              <ReferenceLine
                segment={[
                  { x: +(new Date(entry.date).getTime() - 200000), y: entry.open },
                  { x: entry.date, y: entry.open }
                ]}
                stroke="#82ca9d"
                strokeWidth={1.5}
                ifOverflow="extendDomain"
              />
              {/* Horizontal line at close price */}
              <ReferenceLine
                segment={[
                  { x: entry.date, y: entry.close },
                  { x: +(new Date(entry.date).getTime() + 200000), y: entry.close }
                ]}
                stroke={entry.close >= entry.open ? "rgb(16, 185, 129)" : "rgb(239, 68, 68)"}
                strokeWidth={1.5}
                ifOverflow="extendDomain"
              />
            </React.Fragment>
          ))}
          <Bar 
            dataKey="open" 
            fillOpacity={0}
            strokeOpacity={0}
            name="Open"
          />
          <Bar 
            dataKey="high" 
            fillOpacity={0}
            strokeOpacity={0}
            name="High"
          />
          <Bar 
            dataKey="low" 
            fillOpacity={0}
            strokeOpacity={0}
            name="Low"
          />
          <Bar 
            dataKey="close" 
            fillOpacity={0}
            strokeOpacity={0}
            name="Close"
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
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
          <div className="flex flex-wrap justify-start gap-2">
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
          <div className="flex gap-2 w-full sm:w-auto">
            {/* Resolution Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                  {formatResolution(resolution)} <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Resolution</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {getAvailableResolutions().map((res) => (
                  <DropdownMenuItem 
                    key={res} 
                    onClick={() => handleResolutionChange(res)}
                    className={resolution === res ? "bg-accent" : ""}
                  >
                    {formatResolution(res)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Chart Type Selector */}
            <Select value={chartType} onValueChange={handleChartTypeChange}>
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="area">Area</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
                <SelectItem value="ohlc">OHLC</SelectItem>
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
