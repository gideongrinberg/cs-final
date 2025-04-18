import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, LineData, HistogramData, AreaSeries, AreaData, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPriceHistory, TimeFrame, Resolution } from '@/services/stockService';
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
import { ChevronDown, Clock, Calendar } from 'lucide-react';
import { useTheme } from 'next-themes';

interface StockChartProps {
  ticker: string;
  stockName: string;
  currentPrice: number;
  change: number;
  percentChange: number;
}

type ChartType = 'area' | 'candle' | 'bar';

const StockChart: React.FC<StockChartProps> = ({ 
  ticker, 
  stockName, 
  currentPrice, 
  change, 
  percentChange 
}) => {
  const { theme } = useTheme();
  const [timeframe, setTimeframe] = useState<TimeFrame>('1D');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [resolution, setResolution] = useState<Resolution>('1min');
  const [data, setData] = useState<Array<{ date: Date; price: number }>>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | ISeriesApi<"Candlestick"> | ISeriesApi<"Histogram"> | null>(null);

  const chartOptions = useMemo(() => {
    const isDarkTheme = theme === 'dark';
    
    return {
      layout: {
        background: { 
          type: ColorType.Solid, 
          color: 'transparent' 
        },
        textColor: isDarkTheme ? '#d1d5db' : '#606060',
      },
      grid: {
        vertLines: { 
          color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(42, 46, 57, 0.1)' 
        },
        horzLines: { 
          color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(42, 46, 57, 0.1)' 
        },
      },
      timeScale: {
        borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(42, 46, 57, 0.2)',
        timeVisible: true,
      },
      crosshair: {
        mode: 0, // Normal crosshair mode
        vertLine: {
          color: isDarkTheme ? 'rgba(255, 255, 255, 0.3)' : 'rgba(42, 46, 57, 0.3)',
          width: 1 as const,
          style: 1 as const, // Solid line
        },
        horzLine: {
          color: isDarkTheme ? 'rgba(255, 255, 255, 0.3)' : 'rgba(42, 46, 57, 0.3)',
          width: 1 as const,
          style: 1 as const, // Solid line
        },
      },
      handleScale: {
        axisPressedMouseMove: {
          time: true,
          price: true,
        },
      },
    };
  }, [theme]);

  useEffect(() => {
    if (chartContainerRef.current) {
      if (chartRef.current) {
        chartRef.current.applyOptions(chartOptions);
      } else {
        const chart = createChart(chartContainerRef.current, {
          ...chartOptions,
          width: chartContainerRef.current.clientWidth,
          height: 300,
        });

        chartRef.current = chart;
        
        const handleResize = () => {
          if (chartContainerRef.current && chartRef.current) {
            chartRef.current.applyOptions({ 
              width: chartContainerRef.current.clientWidth,
            });
          }
        };

        window.addEventListener('resize', handleResize);
        
        return () => {
          window.removeEventListener('resize', handleResize);
          if (chartRef.current) {
            chartRef.current.remove();
            chartRef.current = null;
            seriesRef.current = null;
          }
        };
      }
      
      if (dataLoaded && data.length > 0 && seriesRef.current) {
        chartRef.current.removeSeries(seriesRef.current);
        seriesRef.current = null;
      }
    }
  }, [chartOptions, dataLoaded, data.length]);

  useEffect(() => {
    let defaultResolution: Resolution = '1min';
    
    if (['1m', '5m'].includes(timeframe)) {
      defaultResolution = '1sec';
    } else if (['15m', '30m'].includes(timeframe)) {
      defaultResolution = '5sec';
    } else if (timeframe === '1h') {
      defaultResolution = '30sec';
    } else if (timeframe === '1D') {
      defaultResolution = '1min';
    } else if (timeframe === '5D') {
      defaultResolution = '5min';
    } else if (timeframe === '1W') {
      defaultResolution = '15min';
    } else if (timeframe === '1M') {
      defaultResolution = '1hour';
    } else if (timeframe === '3M' || timeframe === '6M') {
      defaultResolution = '1day';
    } else if (timeframe === '1Y') {
      defaultResolution = '1day';
    } else if (timeframe === '5Y') {
      defaultResolution = '1week';
    }
    
    setResolution(defaultResolution);
    const newData = getPriceHistory(ticker, timeframe, defaultResolution);
    setData(newData);
    setDataLoaded(true);
  }, [timeframe, ticker]);

  useEffect(() => {
    if (!chartRef.current || !dataLoaded || data.length === 0) return;

    if (seriesRef.current) {
      chartRef.current.removeSeries(seriesRef.current);
      seriesRef.current = null;
    }

    const isPositive = percentChange >= 0;
    const fillColor = isPositive ? "rgb(16, 185, 129)" : "rgb(239, 68, 68)";
    const borderColor = isPositive ? "rgb(16, 185, 129)" : "rgb(239, 68, 68)";
    const wickUpColor = "rgb(16, 185, 129)";
    const wickDownColor = "rgb(239, 68, 68)";
    
    try {
      if (chartType === 'area') {
        const areaSeries = chartRef.current.addSeries(AreaSeries);
        areaSeries.applyOptions({
          lineColor: borderColor,
          topColor: isPositive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)',
          bottomColor: isPositive ? 'rgba(16, 185, 129, 0.0)' : 'rgba(239, 68, 68, 0.0)',
          lineWidth: 2,
          priceFormat: {
            type: "price",
            precision: 2,
            minMove: 0.01
          }
        });

        const areaData = data.map(item => ({
          time: item.date.getTime() / 1000 as any,
          value: item.price,
        }));

        areaSeries.setData(areaData);
        seriesRef.current = areaSeries;
      } else if (chartType === 'candle') {
        const candleSeries = chartRef.current.addSeries(CandlestickSeries);
        candleSeries.applyOptions({
          upColor: wickUpColor,
          downColor: wickDownColor,
          borderUpColor: wickUpColor,
          borderDownColor: wickDownColor,
          wickUpColor: wickUpColor,
          wickDownColor: wickDownColor,
          priceFormat: {
            type: 'price',
            precision: 2,
            minMove: 0.01,
          },
        });

        const candleData = [];
        for (let i = 0; i < data.length; i++) {
          const currentPrice = data[i].price;
          
          const open = i > 0 ? data[i-1].price : currentPrice * (1 - Math.random() * 0.01);
          const variance = currentPrice * 0.01;
          const high = Math.max(open, currentPrice) + Math.random() * variance;
          const low = Math.min(open, currentPrice) - Math.random() * variance;
          
          candleData.push({
            time: data[i].date.getTime() / 1000 as any,
            open,
            high,
            low,
            close: currentPrice
          });
        }

        candleSeries.setData(candleData);
        seriesRef.current = candleSeries;
      } else if (chartType === 'bar') {
        const barSeries = chartRef.current.addSeries(HistogramSeries)
        barSeries.applyOptions({
          color: fillColor,
          priceFormat: {
            type: 'price',
            precision: 2,
            minMove: 0.01,
          },
        });

        const barData = data.map(item => ({
          time: item.date.getTime() / 1000 as any,
          value: item.price,
          color: fillColor,
        }));

        barSeries.setData(barData);
        seriesRef.current = barSeries;
      }

      chartRef.current.applyOptions({
        localization: {
          priceFormatter: (price: number) => formatCurrency(price),
        },
      });

      chartRef.current.timeScale().fitContent();
    } catch (error) {
      console.error('Error rendering chart:', error);
    }
  }, [data, chartType, percentChange, dataLoaded, currentPrice]);

  const handleTimeframeChange = (newTimeframe: TimeFrame) => {
    setTimeframe(newTimeframe);
  };

  const handleChartTypeChange = (value: string) => {
    setChartType(value as ChartType);
  };
  
  const handleResolutionChange = (value: Resolution) => {
    setResolution(value);
    const newData = getPriceHistory(ticker, timeframe, value);
    setData(newData);
  };

  const getAvailableResolutions = (): Resolution[] => {
    switch (timeframe) {
      case '1m':
      case '5m':
        return ['1sec', '5sec', '30sec'];
      case '15m':
      case '30m':
        return ['1sec', '5sec', '30sec', '1min'];
      case '1h':
        return ['1sec', '5sec', '30sec', '1min', '5min'];
      case '1D':
        return ['1sec', '5sec', '30sec', '1min', '5min', '15min', '30min'];
      case '5D':
        return ['1sec', '5sec', '30sec', '1min', '5min', '15min', '30min', '1hour'];
      case '1W':
        return ['1sec', '5sec', '30sec', '1min', '5min', '15min', '30min', '1hour'];
      case '1M':
        return ['5min', '15min', '30min', '1hour', '1day'];
      case '3M':
      case '6M':
        return ['30min', '1hour', '1day', '1week'];
      case '1Y':
        return ['1hour', '1day', '1week'];
      case '5Y':
        return ['1day', '1week'];
      default:
        return ['1sec', '5sec', '30sec', '1min', '5min', '15min', '30min', '1hour', '1day', '1week'];
    }
  };

  const formatResolution = (res: Resolution): string => {
    switch (res) {
      case '1sec': return '1 Sec';
      case '5sec': return '5 Sec';
      case '30sec': return '30 Sec';
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

  const formatTimeframe = (tf: TimeFrame): string => {
    switch (tf) {
      case '1m': return '1 Min';
      case '5m': return '5 Min';
      case '15m': return '15 Min';
      case '30m': return '30 Min';
      case '1h': return '1 Hour';
      case '1D': return '1 Day';
      case '5D': return '5 Days';
      case '1W': return '1 Week';
      case '1M': return '1 Month';
      case '3M': return '3 Months';
      case '6M': return '6 Months';
      case '1Y': return '1 Year';
      case '5Y': return '5 Years';
      default: return tf;
    }
  };

  const isPositive = percentChange >= 0;
  
  const minuteHourTimeframes: TimeFrame[] = ['1m', '5m', '15m', '30m', '1h'];
  const dayWeekTimeframes: TimeFrame[] = ['1D', '5D', '1W'];
  const monthYearTimeframes: TimeFrame[] = ['1M', '3M', '6M', '1Y', '5Y'];

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatTimeframe(timeframe)}</span>
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Timeframe</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel className="pt-2 text-xs text-muted-foreground">Minutes & Hours</DropdownMenuLabel>
                {minuteHourTimeframes.map((tf) => (
                  <DropdownMenuItem 
                    key={tf} 
                    onClick={() => handleTimeframeChange(tf)}
                    className={timeframe === tf ? "bg-accent" : ""}
                  >
                    {formatTimeframe(tf)}
                  </DropdownMenuItem>
                ))}
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="pt-2 text-xs text-muted-foreground">Days & Weeks</DropdownMenuLabel>
                {dayWeekTimeframes.map((tf) => (
                  <DropdownMenuItem 
                    key={tf} 
                    onClick={() => handleTimeframeChange(tf)}
                    className={timeframe === tf ? "bg-accent" : ""}
                  >
                    {formatTimeframe(tf)}
                  </DropdownMenuItem>
                ))}
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="pt-2 text-xs text-muted-foreground">Months & Years</DropdownMenuLabel>
                {monthYearTimeframes.map((tf) => (
                  <DropdownMenuItem 
                    key={tf} 
                    onClick={() => handleTimeframeChange(tf)}
                    className={timeframe === tf ? "bg-accent" : ""}
                  >
                    {formatTimeframe(tf)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                  <Clock className="h-3 w-3 mr-1" />
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
            
            <Select value={chartType} onValueChange={handleChartTypeChange}>
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="area">Area</SelectItem>
                <SelectItem value="candle">Candle</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="h-[300px] w-full price-chart-area" ref={chartContainerRef}>
          {!dataLoaded && (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted">Loading chart data...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StockChart;
