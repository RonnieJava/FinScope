import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import { EChart } from '@/components/charts/EChart';
import { useChartTheme } from '@/hooks/useChartTheme';

export interface LineSeries {
  name: string;
  values: number[];
  color?: string;
  dashed?: boolean;
  area?: boolean;
}

interface PerformanceChartProps {
  labels: string[];
  series: LineSeries[];
  height?: number;
  valueSuffix?: string;
  decimals?: number;
  ariaLabel?: string;
}

function formatTick(value: string, dense: boolean): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    ...(dense ? {} : { year: '2-digit' as const }),
  });
}

export function PerformanceChart({
  labels,
  series,
  height = 260,
  valueSuffix = '',
  decimals = 2,
  ariaLabel = 'Performance line chart',
}: PerformanceChartProps) {
  const chartTheme = useChartTheme();

  const option = useMemo<EChartsOption>(() => {
    const palette = [chartTheme.accent, chartTheme.up, chartTheme.down, chartTheme.muted, chartTheme.warn ?? chartTheme.muted];
    return {
      animationDuration: 300,
      color: palette,
      grid: { left: 8, right: 12, top: 28, bottom: 6, containLabel: true },
      legend: {
        top: 0,
        right: 0,
        icon: 'roundRect',
        itemWidth: 8,
        itemHeight: 8,
        textStyle: { color: chartTheme.muted, fontSize: 10, fontFamily: 'Fira Sans' },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'var(--panel-2)',
        borderColor: chartTheme.border,
        textStyle: { color: chartTheme.fg, fontSize: 11, fontFamily: 'Fira Sans' },
        axisPointer: { type: 'line', lineStyle: { color: chartTheme.muted, type: 'dashed' } },
        valueFormatter: (value) =>
          `${Number(value).toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })}${valueSuffix}`,
      },
      xAxis: {
        type: 'category',
        data: labels,
        boundaryGap: false,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: chartTheme.muted,
          fontSize: 10,
          hideOverlap: true,
          formatter: (value: string) => formatTick(value, labels.length > 60),
        },
      },
      yAxis: {
        type: 'value',
        scale: true,
        position: 'right',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: chartTheme.grid } },
        axisLabel: {
          color: chartTheme.muted,
          fontSize: 10,
          formatter: (value: number) =>
            `${value.toLocaleString('en-US', { maximumFractionDigits: decimals > 0 ? 1 : 0 })}${valueSuffix}`,
        },
      },
      series: series.map((entry, index) => ({
        type: 'line' as const,
        name: entry.name,
        data: entry.values,
        showSymbol: false,
        smooth: 0.12,
        lineStyle: {
          width: 1.6,
          color: entry.color ?? palette[index % palette.length],
          type: entry.dashed ? ('dashed' as const) : ('solid' as const),
        },
        itemStyle: { color: entry.color ?? palette[index % palette.length] },
        areaStyle: entry.area
          ? {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: chartTheme.areaTop },
                  { offset: 1, color: 'rgba(0,0,0,0)' },
                ],
              },
            }
          : undefined,
      })),
    };
  }, [labels, series, chartTheme, valueSuffix, decimals]);

  return <EChart option={option} themeKey={chartTheme.key} height={height} ariaLabel={ariaLabel} />;
}
