import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import { EChart } from '@/components/charts/EChart';
import { useChartTheme } from '@/hooks/useChartTheme';
import { useFormatters } from '@/hooks/useFormatters';

export interface AllocationSlice {
  name: string;
  value: number;
  color: string;
}

interface AssetAllocationChartProps {
  slices: AllocationSlice[];
  total: number;
  height?: number;
}

export function AssetAllocationChart({ slices, total, height = 240 }: AssetAllocationChartProps) {
  const chartTheme = useChartTheme();
  const formatters = useFormatters();

  const option = useMemo<EChartsOption>(
    () => ({
      animationDuration: 260,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'var(--panel-2)',
        borderColor: chartTheme.border,
        textStyle: { color: chartTheme.fg, fontSize: 11, fontFamily: 'Fira Sans' },
        formatter: (params: unknown) => {
          const point = params as { name: string; value: number; percent: number };
          return `${point.name}<br/>${formatters.money(point.value)} · ${point.percent.toFixed(1)}%`;
        },
      },
      series: [
        {
          type: 'pie',
          radius: ['58%', '82%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: { borderColor: chartTheme.panel, borderWidth: 2 },
          label: { show: false },
          labelLine: { show: false },
          emphasis: { scale: true, scaleSize: 4 },
          data: slices.map((slice) => ({
            name: slice.name,
            value: slice.value,
            itemStyle: { color: slice.color },
          })),
        },
      ],
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: '42%',
          style: {
            text: 'Total',
            fill: chartTheme.muted,
            fontSize: 10,
            fontFamily: 'Fira Sans',
            textAlign: 'center',
          },
        },
        {
          type: 'text',
          left: 'center',
          top: '50%',
          style: {
            text: formatters.compact(total),
            fill: chartTheme.fg,
            fontSize: 16,
            fontWeight: 600,
            fontFamily: 'Fira Code',
            textAlign: 'center',
          },
        },
      ],
    }),
    [slices, total, chartTheme, formatters],
  );

  return (
    <EChart
      option={option}
      themeKey={chartTheme.key}
      height={height}
      ariaLabel="Portfolio allocation donut chart"
    />
  );
}
