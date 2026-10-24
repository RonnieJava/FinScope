import { useEffect, useRef } from 'react';
import {
  ColorType,
  CrosshairMode,
  createChart,
  type CandlestickData,
  type HistogramData,
  type IChartApi,
  type ISeriesApi,
  type Time,
  type UTCTimestamp,
} from 'lightweight-charts';
import { useChartTheme } from '@/hooks/useChartTheme';
import type { Candle } from '@/types';

interface CandlestickChartProps {
  candles: Candle[];
  height?: number;
  showVolume?: boolean;
  showSma?: boolean;
  onHover?: (candle: Candle | null) => void;
}

function toTime(iso: string): UTCTimestamp {
  return Math.floor(new Date(iso).getTime() / 1000) as UTCTimestamp;
}

function smaSeries(candles: Candle[], period: number): Array<{ time: UTCTimestamp; value: number }> {
  const out: Array<{ time: UTCTimestamp; value: number }> = [];
  let sum = 0;
  for (let i = 0; i < candles.length; i += 1) {
    sum += candles[i].close;
    if (i >= period) sum -= candles[i - period].close;
    if (i >= period - 1) {
      out.push({ time: toTime(candles[i].time), value: sum / period });
    }
  }
  return out;
}

export function CandlestickChart({
  candles,
  height = 360,
  showVolume = true,
  showSma = true,
  onHover,
}: CandlestickChartProps) {
  const theme = useChartTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const hoverRef = useRef(onHover);
  hoverRef.current = onHover;

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const chart = createChart(node, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: theme.muted,
        fontFamily: "'Fira Code', monospace",
        fontSize: 10,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: theme.grid },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.08, bottom: showVolume ? 0.26 : 0.06 },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 2,
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: theme.muted, width: 1, style: 2, labelBackgroundColor: theme.border },
        horzLine: { color: theme.muted, width: 1, style: 2, labelBackgroundColor: theme.border },
      },
      handleScale: { axisPressedMouseMove: false },
    });
    chartRef.current = chart;

    const candleSeries: ISeriesApi<'Candlestick'> = chart.addCandlestickSeries({
      upColor: theme.up,
      downColor: theme.down,
      borderUpColor: theme.up,
      borderDownColor: theme.down,
      wickUpColor: theme.up,
      wickDownColor: theme.down,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    const data: CandlestickData<Time>[] = candles.map((candle) => ({
      time: toTime(candle.time),
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));
    candleSeries.setData(data);

    let volumeSeries: ISeriesApi<'Histogram'> | null = null;
    if (showVolume) {
      volumeSeries = chart.addHistogramSeries({
        priceFormat: { type: 'volume' },
        priceScaleId: 'volume',
        priceLineVisible: false,
        lastValueVisible: false,
      });
      chart.priceScale('volume').applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
        visible: false,
      });
      const volumeData: HistogramData<Time>[] = candles.map((candle) => ({
        time: toTime(candle.time),
        value: candle.volume,
        color: candle.close >= candle.open ? `${theme.up}99` : `${theme.down}99`,
      }));
      volumeSeries.setData(volumeData);
    }

    let smaLine: ISeriesApi<'Line'> | null = null;
    if (showSma && candles.length > 20) {
      smaLine = chart.addLineSeries({
        color: theme.accent,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      smaLine.setData(smaSeries(candles, 20));
    }

    chart.timeScale().fitContent();

    const byTime = new Map<number, Candle>();
    for (const candle of candles) byTime.set(toTime(candle.time), candle);

    const handleCrosshair = (param: { time?: Time }) => {
      if (!param.time) {
        hoverRef.current?.(null);
        return;
      }
      const seconds = typeof param.time === 'number' ? param.time : Number.NaN;
      hoverRef.current?.(byTime.get(seconds) ?? null);
    };
    chart.subscribeCrosshairMove(handleCrosshair);

    return () => {
      chart.unsubscribeCrosshairMove(handleCrosshair);
      chart.remove();
      chartRef.current = null;
      hoverRef.current?.(null);
    };
  }, [candles, showVolume, showSma, theme.key, theme.up, theme.down, theme.grid, theme.muted, theme.border, theme.accent]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Candlestick price chart with volume"
      className="w-full"
      style={{ height: `${height}px` }}
    />
  );
}
