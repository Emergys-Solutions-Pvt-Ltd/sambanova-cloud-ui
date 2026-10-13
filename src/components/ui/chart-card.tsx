import { type ReactNode, useId } from "react";

import { cn } from "@/lib/cn";

import { type ChartTone, chartTones } from "./chart-tones";

interface ChartLegendProps {
  items: { label: string; tone: ChartTone }[];
  /** "primary" (white) for single-series charts, "secondary" (gray) beside the title of a multi-series one. */
  labelTone?: "primary" | "secondary";
}

/** Legend of a line chart: a short line with a dot in the series color, then its name (Figma: LineLegends). */
export function ChartLegend({ items, labelTone = "secondary" }: ChartLegendProps) {
  return (
    // 24px items overhang the 18px header by 3px each side, as in Figma.
    <ul className="-my-0.75 flex items-center gap-2">
      {items.map(({ label, tone }) => (
        <li
          key={label}
          className={cn(
            "flex h-6 items-center gap-1 px-1 text-caption leading-tight font-normal",
            labelTone === "primary" ? "text-primary" : "text-secondary",
          )}
        >
          <span
            aria-hidden="true"
            className={cn("relative block size-4 shrink-0", chartTones[tone].text)}
          >
            <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-current" />
            <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current" />
          </span>
          {label}
        </li>
      ))}
    </ul>
  );
}

interface ChartCardProps {
  title: string;
  legend: ReactNode;
  /** Half-width charts: 16px between the header and the chart instead of 20px. */
  compact?: boolean;
  children: ReactNode;
  className?: string;
}

/** Bordered card around a chart with its title and legend (Figma: BarLineChart). */
export function ChartCard({ title, legend, compact, children, className }: ChartCardProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className={cn("rounded-lg border border-default bg-chart-card p-3.75", className)}
    >
      <header className="flex min-h-4.5 flex-wrap items-center justify-between gap-x-4 gap-y-1 sm:h-4.5 sm:flex-nowrap">
        <h3 id={titleId} className="text-body-lg leading-tight font-semibold text-primary">
          {title}
        </h3>
        {legend}
      </header>
      <div className={compact ? "mt-4" : "mt-5"}>{children}</div>
    </section>
  );
}
