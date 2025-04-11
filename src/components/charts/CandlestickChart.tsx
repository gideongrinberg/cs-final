
import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, TimeRange } from 'lightweight-charts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getPriceHistory } from '@/services/stockService';
import { formatCurrency } from '@/utils/stockUtils';
import { Badge } from '@/components/ui/badge';

interface CandlestickChartProps {
  ticker: string;
  stockName: string;
  currentPrice: number;
  change: number;
  percentChange: number;
}

// Available time frames
type TimeFrame = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y';

// Available data resolutions
type Resolution = '1m' | '5m' | '15m' | '30m' | '1h' | '1d';

const CandlestickChart: React.FC<CandlestickChartProps> = ({ 
  ticker, 
  stockName, 
  currentPrice, 
  change, 
  percentChange 
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [timeframe, setTimeframe] = useState<TimeFrame>('1D');
  const [resolution, setResolution] = useState<Resolution>('5m');
  const [chartType, setChartType] = useState<'candlestick' | 'area'>('candlestick');
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | ISeriesApi<'Area'> | null>(null);

  // Effect for creating the chart and handling resize
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.applyOptions({ 
          width: chartContainerRef.current?.clientWidth || 600 
        });
      }
    };

    // Initialize chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#777E90',
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.2)' },
        horzLines: { color: 'rgba(42, 46, 57, 0.2)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: 'rgba(197, 203, 206, 0.3)',
      },
      rightPriceScale: {
        borderColor: 'rgba(197, 203, 206, 0.3)',
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: 'rgba(83, 56, 248, 0.4)',
          style: 1,
        },
        horzLine: {
          width: 1,
          color: 'rgba(83, 56, 248, 0.4)',
          style: 1,
          labelBackgroundColor: 'rgba(83, 56, 248, 0.9)',
        },
      },
    });

    chartRef.current = chart;

    // Setup window resize listener
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // Effect for updating chart data based on timeframe and resolution
  useEffect(() => {
    if (!chartRef.current) return;

    // Fetch the data
    const priceData = getPriceHistory(ticker, timeframe, resolution);
    
    // Format data for lightweight-charts
    const formattedData = priceData.map(item => {
      return {
        time: item.date.getTime() / 1000,
        open: item.open || item.price,
        high: item.high || item.price,
        low: item.low || item.price,
        close: item.close || item.price,
      } as CandlestickData;
    });

    // Clear any existing series
    if (seriesRef.current) {
      chartRef.current.removeSeries(seriesRef.current);
      seriesRef.current = null;
    }

    // Add appropriate series based on chart type
    if (chartType === 'candlestick') {
      const candlestickSeries = chartRef.current.addCandlestickSeries({
        upColor: 'rgb(16, 185, 129)',
        downColor: 'rgb(239, 68, 68)',
        borderVisible: false,
        wickUpColor: 'rgb(16, 185, 129)',
        wickDownColor: 'rgb(239, 68, 68)',
      });
      candlestickSeries.setData(formattedData);
      seriesRef.current = candlestickSeries;
    } else {
      const areaSeries = chartRef.current.addAreaSeries({
        lineColor: percentChange >= 0 ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)',
        topColor: percentChange >= 0 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)',
        bottomColor: percentChange >= 0 ? 'rgba(16, 185, 129, 0.0)' : 'rgba(239, 68, 68, 0.0)',
        lineWidth: 2,
      });
      
      const areaData = formattedData.map(item => ({
        time: item.time,
        value: item.close,
      }));
      
      areaSeries.setData(areaData);
      seriesRef.current = areaSeries;
    }

    // Adjust time scale to fit all data
    chartRef.current.timeScale().fitContent();

  }, [ticker, timeframe, resolution, chartType, percentChange]);

  // Handle timeframe changes
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
  };

  // Handle resolution changes
  const handleResolutionChange = (newResolution: Resolution) => {
    setResolution(newResolution);
  };

  // Toggle chart type
  const handleChartTypeChange = (type: 'candlestick' | 'area') => {
    setChartType(type);
  };

  // Format for display
  const isPositive = percentChange >= 0;
  const changeDisplay = `${isPositive ? '+' : ''}${formatCurrency(change)} (${percentChange.toFixed(2)}%)`;
  const changeColorClass = isPositive ? 'text-green-500' : 'text-red-500';

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={chartType === 'candlestick' ? "default" : "outline"}
              size="sm"
              className="px-3"
              onClick={() => handleChartTypeChange('candlestick')}
            >
              Candlestick
            </Button>
            <Button
              variant={chartType === 'area' ? "default" : "outline"}
              size="sm"
              className="px-3"
              onClick={() => handleChartTypeChange('area')}
            >
              Area
            </Button>
          </div>
          
          <div>
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

        <div className="mb-4 flex items-center justify-between">
          <div>
            <Badge variant="outline" className="text-xs px-2 py-0.5 mb-1">
              {ticker}
            </Badge>
            <div className="text-lg font-semibold">{formatCurrency(currentPrice)}</div>
            <div className={`text-sm ${changeColorClass}`}>{changeDisplay}</div>
          </div>
        </div>
        
        <div className="h-[400px] overflow-hidden" ref={chartContainerRef}></div>
        
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

export default CandlestickChart;
