import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import { EChart } from '@/components/charts/EChart';
import { useChartTheme } from '@/hooks/useChartTheme';
import { useFormatters } from '@/hooks/useFormatters';
import type { HistoricalPrice, TimeRange } from '@/types';

interface MarketOverviewChartProps {
  series: HistoricalPrice[];
  symbol: string;
  range: TimeRange;
  height?: number;
}

function withAlpha(color: string, alpha: number): string {
  const hex = color.trim().replace('#', '');
  if (hex.length !== 6) return color;
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) return color;
  return `rgba(${r},${g},${b},${alpha})`;
}

export function MarketOverviewChart({ series, symbol, range, height = 300 }: MarketOverviewChartProps) {
  const chartTheme = useChartTheme();
  const formatters = useFormatters();

  const option = useMemo<EChartsOption>(() => {
    const dates = series.map((point) => point.time);
    const values = series.map((point) => point.close);
    const first = values[0] ?? 0;
    const last = values[values.length - 1] ?? 0;
    const rising = last >= first;
    const lineColor = rising ? chartTheme.up : chartTheme.down;

    return {
      animationDuration: 300,
      grid: { left: 8, right: 12, top: 16, bottom: 8, containLabel: true },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'var(--panel-2)',
        borderColor: chartTheme.border,
        borderWidth: 1,
        padding: [8, 10],
        textStyle: { color: chartTheme.fg, fontSize: 12, fontFamily: 'Fira Sans' },
        axisPointer: {
          type: 'cross',
          lineStyle: { color: chartTheme.muted, width: 1, type: 'dashed' },
          label: { backgroundColor: chartTheme.border, color: chartTheme.fg, fontSize: 10 },
        },
        formatter: (params: unknown) => {
          const list = params as Array<{ axisValue: string; dataIndex: number }>;
          const point = list[0];
          if (!point) return '';
          const row = series[point.dataIndex];
          if (!row) return '';
          const change = ((row.close - first) / (first || 1)) * 100;
          const color = change >= 0 ? chartTheme.up : chartTheme.down;
          const stamp = new Date(row.time);
          const label =
            range === '1D'
              ? stamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
              : stamp.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
          return `
            <div style="min-width:150px">
              <div style="font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:${chartTheme.muted}">${label}</div>
              <div style="margin-top:4px;font-family:'Fira Code',monospace;font-size:14px;color:${chartTheme.fg}">
                ${symbol} ${formatters.price(row.close, 2)}
              </div>
              <div style="font-family:'Fira Code',monospace;font-size:11px;color:${color}">
                ${change >= 0 ? '+' : ''}${change.toFixed(2)}% vs range start
              </div>
              <div style="margin-top:4px;font-family:'Fira Code',monospace;font-size:10px;color:${chartTheme.muted}">
                H ${formatters.price(row.high, 2)} · L ${formatters.price(row.low, 2)}
              </div>
            </div>`;
        },
      },
      xAxis: {
        type: 'category',
        data: dates,
        boundaryGap: false,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
          color: chartTheme.muted,
          fontSize: 10,
          hideOverlap: true,
          formatter: (value: string) => {
            const date = new Date(value);
            if (range === '1D') {
              return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
            }
            return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
          },
        },
      },
      yAxis: {
        type: 'value',
        position: 'right',
        scale: true,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: chartTheme.grid } },
        axisLabel: {
          color: chartTheme.muted,
          fontSize: 10,
          formatter: (value: number) => formatters.price(value, 0),
        },
      },
      series: [
        {
          type: 'line',
          name: symbol,
          data: values,
          showSymbol: false,
          smooth: 0.15,
          lineStyle: { width: 1.8, color: lineColor },
          itemStyle: { color: lineColor },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: withAlpha(lineColor, 0.24) },
                { offset: 1, color: withAlpha(lineColor, 0) },
              ],
            },
          },
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: { color: chartTheme.muted, type: 'dashed', opacity: 0.5 },
            label: { show: false },
            data: [{ yAxis: first }],
          },
        },
      ],
    };
  }, [series, range, symbol, chartTheme, formatters]);

  return (
    <EChart
      option={option}
      themeKey={chartTheme.key}
      height={height}
      ariaLabel={`${symbol} ${range} price trend chart`}
    />
  );
}
