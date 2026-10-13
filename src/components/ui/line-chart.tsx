"use client";

import {
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { niceScale, smoothPath } from "@/lib/chart";
import { cn } from "@/lib/cn";
import { useElementWidth } from "@/lib/use-element-width";

import { type ChartTone, chartTones } from "./chart-tones";

/**
 * Figma sizes: the full-width chart has a 213px plot, the half-width ones 222px, and the day
 * labels sit 2px inside the plot's bottom edge in a 23px row. `box` and `outer` are the same
 * numbers as Tailwind classes (plot height, plot plus labels).
 */
const VARIANTS = {
  wide: { height: 213, box: "h-53.25", outer: "h-58.5", minLabelPitch: 90 },
  compact: { height: 222, box: "h-55.5", outer: "h-60.75", minLabelPitch: 42 },
} as const;

const GRID_PADDING = 6;
const LABEL_OVERLAP = 2;
const DOT_RADIUS = 4;
const TOOLTIP_WIDTH = 192;
const TOOLTIP_ARROW_WIDTH = 34;
/** Space between the tooltip's pointer and the top of the dot. */
const TOOLTIP_GAP = 2;

export interface LineChartSeries {
  id: string;
  /** Shown in the tooltip: "Input Tokens". */
  label: string;
  tone: ChartTone;
  /** One value per category. */
  values: number[];
}

export interface LineChartCategory {
  /** Short text under the axis: "Jun 25". */
  label: string;
  /** Tooltip heading: "Jul 16, 2026". */
  title: string;
}

interface LineChartProps {
  categories: LineChartCategory[];
  series: LineChartSeries[];
  variant: keyof typeof VARIANTS;
  /** Space between the plot's left and right edges and the first and last point, in px. */
  insetStart?: number;
  insetEnd?: number;
  formatTick: (value: number) => string;
  formatValue: (value: number) => string;
  /** Accessible name of the chart. */
  label: string;
  emptyLabel?: string;
  className?: string;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/** Indexes whose axis label is shown: every `step`-th point, plus the last one when there is room. */
function labelIndexes(count: number, pitch: number, minPitch: number) {
  const step = Math.max(1, Math.ceil(minPitch / Math.max(pitch, 1)));
  const indexes: number[] = [];
  for (let index = 0; index < count; index += step) indexes.push(index);
  const last = count - 1;
  const previous = indexes[indexes.length - 1];
  if (previous !== undefined && previous !== last && (last - previous) * pitch >= minPitch * 0.7) {
    indexes.push(last);
  }
  return indexes;
}

/**
 * Smooth multi-series line chart drawn as SVG (Figma: BarLineChart cards): dashed gridlines with a
 * solid 0 line, glowing 1px lines, 8px dots, and a white tooltip with a pointer for the point
 * under the pointer. Arrow keys, Home and End step through the points of a focused chart; a
 * hidden table gives screen readers the same numbers.
 */
export function LineChart({
  categories,
  series,
  variant,
  insetStart: requestedInsetStart = 24,
  insetEnd: requestedInsetEnd = 24,
  formatTick,
  formatValue,
  label,
  emptyLabel = "No usage in this period",
  className,
}: LineChartProps) {
  const uid = useId().replaceAll(":", "");
  const plotRef = useRef<HTMLDivElement>(null);
  const width = useElementWidth(plotRef);
  const [active, setActive] = useState<number | null>(null);
  const { height, box, outer, minLabelPitch } = VARIANTS[variant];
  const count = categories.length;

  const maxValue = Math.max(0, ...series.flatMap((item) => item.values));
  const scale = useMemo(() => niceScale(maxValue), [maxValue]);
  const tickLabels = scale.ticks.map(formatTick);
  const widestTick = tickLabels.reduce((a, b) => (b.length > a.length ? b : a), "");

  const gridBottom = height - GRID_PADDING;
  const plotHeight = height - GRID_PADDING * 2;
  // Narrow charts (phones) keep the insets proportionate instead of giving up a third of the plot.
  const insetStart = Math.min(requestedInsetStart, width * 0.08);
  const insetEnd = Math.min(requestedInsetEnd, width * 0.08);
  const span = Math.max(0, width - insetStart - insetEnd);
  const pitch = count > 1 ? span / (count - 1) : span;
  const xOf = (index: number) => (count > 1 ? insetStart + index * pitch : insetStart + span / 2);
  const yOf = (value: number) => gridBottom - (value / scale.max) * plotHeight;

  // Dots touch when points are closer than a dot and a half; then only the active point keeps its dot.
  const showDots = pitch >= DOT_RADIUS * 3;

  const labelled = useMemo(
    () => labelIndexes(count, pitch, minLabelPitch),
    [count, pitch, minLabelPitch],
  );

  const indexAt = (clientX: number) => {
    const left = plotRef.current?.getBoundingClientRect().left ?? 0;
    if (count <= 1 || span === 0) return 0;
    return clamp(Math.round(((clientX - left - insetStart) / span) * (count - 1)), 0, count - 1);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => setActive(indexAt(event.clientX));
  const onPointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    // A tap leaves immediately on touch screens; the tooltip stays until focus moves away.
    if (event.pointerType === "mouse") setActive(null);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = count - 1;
    const current = active ?? last;
    const next: Record<string, number | null> = {
      ArrowLeft: Math.max(0, current - 1),
      ArrowRight: Math.min(last, current + 1),
      Home: 0,
      End: last,
      Escape: null,
    };
    if (!(event.key in next)) return;
    event.preventDefault();
    setActive(next[event.key] ?? null);
  };

  const hasData = maxValue > 0;
  const activeCategory = active === null ? undefined : categories[active];
  const activeRows =
    active === null
      ? []
      : series.map((item) => ({ label: item.label, value: formatValue(item.values[active] ?? 0) }));
  const summary = activeCategory
    ? `${activeCategory.title}. ${activeRows.map((row) => `${row.label}: ${row.value}`).join(". ")}`
    : "";

  // The tooltip points at the highest dot of the active column.
  let tooltip: ReactNode = null;
  if (active !== null && activeCategory && width > 0) {
    const x = xOf(active);
    const topY = Math.min(...series.map((item) => yOf(item.values[active] ?? 0)));
    const boxLeft = clamp(x - TOOLTIP_WIDTH / 2, 0, Math.max(0, width - TOOLTIP_WIDTH));
    const arrowLeft = clamp(
      x - boxLeft - TOOLTIP_ARROW_WIDTH / 2,
      6,
      TOOLTIP_WIDTH - TOOLTIP_ARROW_WIDTH - 6,
    );
    tooltip = (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute z-raised w-48 -translate-y-full"
        style={{ left: boxLeft, top: topY - DOT_RADIUS - TOOLTIP_GAP }}
      >
        <div className="animate-pop-in">
          <div className="flex flex-col gap-1.5 rounded-md border-(length:--sn-border-thin) border-chart-tooltip bg-chart-tooltip px-3 py-2.5 shadow-md">
            <p className="text-body leading-normal font-medium text-chart-tooltip-title">
              {activeCategory.title}
            </p>
            <div className="flex flex-col gap-0.5 text-caption leading-normal font-normal text-chart-tooltip-label">
              {activeRows.map((row) => (
                <p key={row.label}>
                  {row.label}:{" "}
                  <span className="font-bold text-chart-tooltip-value">{row.value}</span>
                </p>
              ))}
            </div>
          </div>
          <div
            className="h-2 w-8.5 bg-chart-tooltip [clip-path:polygon(0_0,100%_0,50%_100%)]"
            style={{ marginLeft: arrowLeft }}
          />
        </div>
      </div>
    );
  }

  const tones = [...new Set(series.map((item) => item.tone))];

  return (
    <div
      role="group"
      tabIndex={0}
      aria-label={`${label}. Use the arrow keys to read each point.`}
      onKeyDown={onKeyDown}
      onFocus={() => setActive((current) => current ?? count - 1)}
      onBlur={() => setActive(null)}
      className={cn("flex", className)}
    >
      <div aria-hidden="true" className={cn("relative shrink-0", box)}>
        {/* Invisible copy of the widest label sets the column width: 4px either side, like Figma. */}
        <span className="invisible block px-1 text-caption leading-tight font-normal whitespace-nowrap">
          {widestTick}
        </span>
        {scale.ticks.map((tick, index) => (
          <span
            key={tick}
            className="absolute right-1 -translate-y-1/2 text-caption leading-tight font-normal whitespace-nowrap text-secondary"
            style={{ top: yOf(tick) }}
          >
            {tickLabels[index]}
          </span>
        ))}
      </div>

      <div
        ref={plotRef}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerMove}
        onPointerLeave={onPointerLeave}
        className={cn("relative min-w-0 flex-1", outer)}
      >
        {width > 0 && (
          <svg width={width} height={height} aria-hidden="true" className="block overflow-visible">
            <defs>
              {/* The line's glow: three offset blurs of its own color at 40% (Figma: 3 drop shadows). */}
              {tones.map((tone) => (
                <filter
                  key={tone}
                  id={`${uid}-${tone}`}
                  filterUnits="userSpaceOnUse"
                  x={-20}
                  y={-20}
                  width={width + 40}
                  height={height + 60}
                  colorInterpolationFilters="sRGB"
                  className={chartTones[tone].text}
                >
                  <feFlood floodColor="currentColor" floodOpacity={0.4} result="tint" />
                  <feComposite in="tint" in2="SourceAlpha" operator="in" result="glow" />
                  <feGaussianBlur in="glow" stdDeviation={1.5} result="blur1" />
                  <feOffset in="blur1" dy={3} result="shadow1" />
                  <feGaussianBlur in="glow" stdDeviation={4.5} result="blur2" />
                  <feOffset in="blur2" dy={6} result="shadow2" />
                  <feGaussianBlur in="glow" stdDeviation={9} result="blur3" />
                  <feOffset in="blur3" dy={9} result="shadow3" />
                  <feMerge>
                    <feMergeNode in="shadow3" />
                    <feMergeNode in="shadow2" />
                    <feMergeNode in="shadow1" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
            </defs>

            {scale.ticks.map((tick, index) => (
              <line
                key={tick}
                x1={0}
                x2={width}
                y1={yOf(tick)}
                y2={yOf(tick)}
                strokeWidth={1}
                strokeDasharray={index === 0 ? undefined : "2"}
                shapeRendering="crispEdges"
                className={index === 0 ? "stroke-chart-baseline" : "stroke-chart-grid"}
              />
            ))}

            {/* The first series is drawn last, so it sits on top (Figma: Input over Output). */}
            {[...series].reverse().map((item) => {
              const points = item.values.map((value, index) => ({ x: xOf(index), y: yOf(value) }));
              return (
                <g key={item.id}>
                  <path
                    d={smoothPath(points)}
                    fill="none"
                    strokeWidth={1}
                    strokeLinecap="round"
                    filter={`url(#${uid}-${item.tone})`}
                    className={chartTones[item.tone].stroke}
                  />
                  {points.map((point, index) =>
                    showDots || index === active ? (
                      <circle
                        key={index}
                        cx={point.x}
                        cy={point.y}
                        r={DOT_RADIUS}
                        strokeWidth={1}
                        className={cn(chartTones[item.tone].fill, chartTones[item.tone].stroke)}
                      />
                    ) : null,
                  )}
                </g>
              );
            })}
          </svg>
        )}

        {!hasData && width > 0 && (
          <p className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-8 text-center text-caption font-normal text-muted">
            {emptyLabel}
          </p>
        )}

        {width > 0 &&
          labelled.map((index) => (
            <span
              key={index}
              aria-hidden="true"
              className="absolute -translate-x-1/2 text-caption leading-tight font-normal whitespace-nowrap text-secondary"
              style={{ left: xOf(index), top: height - LABEL_OVERLAP }}
            >
              {categories[index]?.label}
            </span>
          ))}

        {tooltip}
      </div>

      <p role="status" className="sr-only">
        {summary}
      </p>
      <table className="sr-only">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            {series.map((item) => (
              <th key={item.id} scope="col">
                {item.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map((category, index) => (
            <tr key={index}>
              <th scope="row">{category.title}</th>
              {series.map((item) => (
                <td key={item.id}>{formatValue(item.values[index] ?? 0)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
