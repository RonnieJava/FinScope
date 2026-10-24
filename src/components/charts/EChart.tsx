import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  GraphicComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  TooltipComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';
import clsx from 'clsx';

// Only the chart types and components FinScope actually renders are bundled,
// which keeps the ECharts chunk far smaller than the full `echarts` entry.
echarts.use([
  LineChart,
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkLineComponent,
  GraphicComponent,
  CanvasRenderer,
]);

type EChartsInstance = ReturnType<typeof echarts.init>;

interface EChartProps {
  option: EChartsOption;
  /** Change this to force a full re-render (theme switches). */
  themeKey?: string;
  className?: string;
  height?: number | string;
  ariaLabel?: string;
}

/**
 * Thin ECharts wrapper: owns the instance, applies options, follows container resizes
 * and disposes on unmount. Charts never generate their own data.
 */
export function EChart({ option, themeKey = 'default', className, height = 280, ariaLabel }: EChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<EChartsInstance | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const chart = echarts.init(node, undefined, { renderer: 'canvas' });
    chartRef.current = chart;

    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(node);

    return () => {
      observer.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    chartRef.current?.setOption(option, { notMerge: true });
  }, [option, themeKey]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={ariaLabel}
      className={clsx('w-full', className)}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    />
  );
}
