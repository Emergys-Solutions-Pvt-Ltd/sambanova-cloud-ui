import { type SVGProps } from "react";

import { cn } from "@/lib/cn";

import { iconData, type IconName } from "./icon-data.generated";

const SIZES = { xs: 12, sm: 16, md: 20, lg: 24, xl: 28 } as const;

const COLORS = {
  current: "",
  primary: "text-primary",
  secondary: "text-secondary",
  muted: "text-muted",
  brand: "text-brand",
  "on-brand": "text-on-brand",
  success: "text-success",
  error: "text-error",
  warning: "text-warning",
  info: "text-info",
} as const;

export type IconSize = keyof typeof SIZES | number;
export type IconColor = keyof typeof COLORS;

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "color" | "name"> {
  name: IconName;
  /** Token size (xs 12 · sm 16 · md 20 · lg 24 · xl 28) or a pixel value. Default md. */
  size?: IconSize;
  /** Semantic color. Default `current` inherits the surrounding text color. */
  color?: IconColor;
  /** Accessible name. Without it the icon is decorative and hidden from assistive tech. */
  label?: string;
}

/** SVG icon from the Figma set. Inherits `currentColor` for stroke and fill. */
export function Icon({
  name,
  size = "md",
  color = "current",
  label,
  className,
  ...rest
}: IconProps) {
  const icon = iconData[name];
  const px = typeof size === "number" ? size : SIZES[size];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={px}
      height={px}
      viewBox={icon.viewBox}
      fill={icon.fill}
      stroke={"stroke" in icon ? icon.stroke : undefined}
      strokeWidth={"strokeWidth" in icon ? icon.strokeWidth : undefined}
      strokeLinecap={
        "strokeLinecap" in icon
          ? (icon.strokeLinecap as SVGProps<SVGSVGElement>["strokeLinecap"])
          : undefined
      }
      strokeLinejoin={
        "strokeLinejoin" in icon
          ? (icon.strokeLinejoin as SVGProps<SVGSVGElement>["strokeLinejoin"])
          : undefined
      }
      className={cn("shrink-0", COLORS[color], className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      // Generated from our own optimised SVG files at build time; never user input.
      dangerouslySetInnerHTML={{ __html: icon.body }}
      {...rest}
    />
  );
}
