import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import { EChart } from '@/components/charts/EChart';
import { useChartTheme } from '@/hooks/useChartTheme';
import { useFormatters } from '@/hooks/useFormatters';
import type { Candle, TimeRange } from '@/types';

interface VolumeChartProps {
  candles: Candle[];
  range: TimeRange;
  height?: number;
}

export function VolumeChart({ candles, range, height = 120 }: VolumeChartProps) {
  const chartTheme = useChartTheme();
  const formatters = useFormatters();

  const option = useMemo<EChartsOption>(
    () => ({
      animationDuration: 220,
      grid: { left: 8, right: 12, top: 8, bottom: 4, containLabel: true },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'var(--panel-2)',
        borderColor: chartTheme.border,
        textStyle: { color: chartTheme.fg, fontSize: 11, fontFamily: 'Fira Sans' },
        axisPointer: { type: 'shadow' },
        formatter: (params: unknown) => {
          const list = params as Array<{ axisValue: string; dataIndex: number }>;
          const point = list[0];
          const candle = point ? candles[point.dataIndex] : undefined;
          if (!candle || !point) return '';
          return `${point.axisValue}<br/>Vol ${formatters.compact(candle.volume)}`;
        },
      },
      xAxis: {
        type: 'category',
        data: candles.map((candle) => candle.time),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: chartTheme.grid } },
        axisLabel: {
          color: chartTheme.muted,
          fontSize: 9,
          formatter: (value: number) => formatters.compact(value),
        },
      },
      series: [
        {
          type: 'bar',
          data: candles.map((candle) => ({
            value: candle.volume,
            itemStyle: {
              color: candle.close >= candle.open ? chartTheme.up : chartTheme.down,
              opacity: 0.55,
            },
          })),
          barMaxWidth: 10,
        },
      ],
    }),
    [candles, chartTheme, formatters],
  );

  return (
    <EChart
      option={option}
      themeKey={chartTheme.key}
      height={height}
      ariaLabel={`Volume chart for the selected ${range} range`}
    />
  );
}
