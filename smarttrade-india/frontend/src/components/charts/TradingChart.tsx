import { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';
import { Box, useTheme } from '@mui/material';

interface TradingChartProps {
  symbol: string;
  height?: number;
}

export default function TradingChart({ symbol, height = 400 }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const theme = useTheme();

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: theme.palette.text.secondary,
      },
      grid: {
        vertLines: { color: theme.palette.divider },
        horzLines: { color: theme.palette.divider },
      },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: theme.palette.divider },
      timeScale: { borderColor: theme.palette.divider, timeVisible: true },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#00C853',
      downColor: '#FF1744',
      borderVisible: false,
      wickUpColor: '#00C853',
      wickDownColor: '#FF1744',
    });

    const now = Math.floor(Date.now() / 1000);
    const basePrice = 2400 + Math.random() * 500;
    const data = Array.from({ length: 100 }, (_, i) => {
      const open = basePrice + (Math.random() - 0.5) * 50;
      const close = open + (Math.random() - 0.5) * 30;
      const high = Math.max(open, close) + Math.random() * 15;
      const low = Math.min(open, close) - Math.random() * 15;
      return {
        time: (now - (100 - i) * 86400) as unknown as string,
        open, high, low, close,
      };
    });

    candleSeries.setData(data);
    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = candleSeries;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [symbol, height, theme]);

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <Box ref={containerRef} sx={{ width: '100%' }} />
    </Box>
  );
}
