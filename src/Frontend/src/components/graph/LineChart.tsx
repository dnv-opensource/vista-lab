import { AxisScaleOutput, TickFormatter } from '@visx/axis';
import { ScaleConfig } from '@visx/scale';
import {
  AnimatedAreaSeries,
  AnimatedAxis,
  AnimatedBarSeries,
  AnimatedGrid,
  AnimatedLineSeries,
  AreaStack,
  BarGroup,
  Tooltip,
  XYChart,
} from '@visx/xychart';
import { RenderTooltipParams } from '@visx/xychart/lib/components/Tooltip';
import clsx from 'clsx';
import React, { useMemo, useRef } from 'react';
import './LineChart.scss';

export type Accessors<T> = {
  xAccessor: (d: T) => T[keyof T] | string | number | undefined;
  yAccessor: (d: T) => T[keyof T] | string | number | undefined;
};

export type AxisFormatter<T> = {
  xAxis?: TickFormatter<T[keyof T]>;
  yAxis?: TickFormatter<T[keyof T]>;
};

export enum ChartType {
  Line,
  Area,
  Bar,
}

interface LineChartProps<T extends object> {
  accessors: Accessors<T>;
  axisFormatter?: AxisFormatter<T>;
  topOffset: number;
  bottomOffset: number;
  dataset: {
    data: T[];
    key: string;
  }[];
  type?: ChartType;
  tooltipComponent?: (params: RenderTooltipParams<T> & { accessors: Accessors<T> }) => JSX.Element;
  children?: React.ReactNode;
  className?: string;
}

const LineChart = <T extends object>({
  accessors,
  dataset,
  axisFormatter,
  tooltipComponent,
  children,
  type = ChartType.Line,
  className,
  topOffset,
  bottomOffset,
}: LineChartProps<T>) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const chartComponent = useMemo(() => {
    switch (type) {
      case ChartType.Line:
        return dataset.map(subset => (
          <AnimatedLineSeries key={subset.key} dataKey={subset.key} data={subset.data} {...accessors} />
        ));
      case ChartType.Area:
        return (
          <AreaStack>
            {dataset.map(subset => (
              <AnimatedAreaSeries key={subset.key} dataKey={subset.key} data={subset.data} {...accessors} />
            ))}
          </AreaStack>
        );

      case ChartType.Bar:
        return (
          <BarGroup>
            {dataset.map(subset => (
              <AnimatedBarSeries key={subset.key} dataKey={subset.key} data={subset.data} {...accessors} />
            ))}
          </BarGroup>
        );
    }
  }, [dataset, type, accessors]);

  return (
    <div className={clsx('graph-container', className)} ref={wrapperRef}>
      <XYChart<ScaleConfig<AxisScaleOutput>, ScaleConfig<AxisScaleOutput>, T>
        xScale={{ type: 'band' }}
        yScale={{ type: 'linear', domain: [bottomOffset, topOffset] }}
      >
        <AnimatedAxis orientation="left" tickFormat={axisFormatter?.yAxis} />
        <AnimatedAxis orientation="bottom" numTicks={4} tickFormat={axisFormatter?.xAxis} />
        <AnimatedGrid columns={true} rows={true} />

        <Tooltip<T>
          snapTooltipToDatumX
          snapTooltipToDatumY
          showVerticalCrosshair
          showSeriesGlyphs
          renderTooltip={({ tooltipData, colorScale, ...restProps }) => (
            <>
              <div style={{ color: colorScale?.(tooltipData!.nearestDatum!.key) }}>
                {tooltipComponent
                  ? tooltipComponent({ tooltipData, colorScale, ...restProps, accessors })
                  : tooltipData?.nearestDatum?.key}
              </div>
            </>
          )}
        />
        {chartComponent}

        {children}
      </XYChart>
    </div>
  );
};

export default LineChart;
