import { AxisScaleOutput } from '@visx/axis';
import { ScaleConfig } from '@visx/scale';
import {
  AnimatedAreaSeries,
  AnimatedBarSeries,
  AnimatedLineSeries,
  AreaStack,
  BarGroup,
  Tooltip,
  XYChart,
} from '@visx/xychart';
import { RenderTooltipParams } from '@visx/xychart/lib/components/Tooltip';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import './LineChart.scss';

type Accessors<T> = {
  xAccessor: (d?: T) => T[keyof T] | undefined;
  yAccessor: (d?: T) => T[keyof T] | undefined;
};

export enum ChartType {
  Line,
  Area,
  Bar,
}

interface GraphProps<T extends object> {
  accessors: Accessors<T>;
  dataset: {
    data: T[];
    key: string;
  }[];
  type?: ChartType;
  tooltipComponent?: (params: RenderTooltipParams<T> & { accessors: Accessors<T> }) => JSX.Element;
  children?: React.ReactNode;
}

const LineChart = <T extends object>({
  accessors,
  dataset,
  tooltipComponent,
  children,
  type = ChartType.Line,
}: GraphProps<T>) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isMounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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
    <div className={'graph-container'} ref={wrapperRef}>
      {isMounted && (
        <XYChart<ScaleConfig<AxisScaleOutput>, ScaleConfig<AxisScaleOutput>, T>
          height={wrapperRef.current?.clientHeight}
          xScale={{ type: 'band' }}
          yScale={{ type: 'linear' }}
        >
          {chartComponent}

          <Tooltip<T>
            snapTooltipToDatumX
            snapTooltipToDatumY
            showVerticalCrosshair
            showSeriesGlyphs
            renderTooltip={({ tooltipData, colorScale, ...restProps }) => (
              <>
                <div style={{ color: colorScale?.(tooltipData!.nearestDatum!.key) }}>
                  {tooltipData?.nearestDatum?.key}
                </div>
                {tooltipComponent && tooltipComponent({ tooltipData, colorScale, ...restProps, accessors })}
              </>
            )}
          />
          {children}
        </XYChart>
      )}
    </div>
  );
};

export default LineChart;
