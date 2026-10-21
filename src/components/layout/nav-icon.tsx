import { type CSSProperties, type ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Sidebar icons that animate on hover (Figma: Dashboard, Playground, API Keys, Usage, Pricing and
 * Project Settings nav items, Default -> Hover smart animate, 0.3s ease-out). Every part is drawn in
 * the 20px frame's own coordinates; the parts that move carry the Figma transform of their Default
 * and Hover variants as `matrix()` values, and CSS interpolates between them (see `.nav-icon-part`
 * in globals.css). The animation runs while the nearest `data-nav-animate` link is hovered, so the
 * active item, which has no hover variant in Figma, just omits the attribute.
 */
export type NavIconName =
  "dashboard" | "playground" | "api-keys" | "usage" | "pricing" | "settings";

const animated: ReadonlySet<string> = new Set<NavIconName>([
  "dashboard",
  "playground",
  "api-keys",
  "usage",
  "pricing",
  "settings",
]);

export const isNavIconName = (name: string): name is NavIconName => animated.has(name);

/** Figma `relativeTransform` [[a, c, e], [b, d, f]] as a CSS matrix. */
const m = (a: number, b: number, c: number, d: number, e: number, f: number) =>
  `matrix(${a}, ${b}, ${c}, ${d}, ${e}, ${f})`;
const at = (x: number, y: number) => m(1, 0, 0, 1, x, y);
/** Vertical scale about the line's fixed bottom end (y = `bottom`), for bars that grow or shrink. */
const grow = (scale: number, bottom: number) =>
  m(1, 0, 0, scale, 0, +(bottom * (1 - scale)).toFixed(3));

function Part({
  rest,
  hover,
  fixedStroke,
  origin,
  children,
}: {
  rest: string;
  hover: string;
  /** Keeps the stroke (and its round caps) at 1.25px while the part is scaled. */
  fixedStroke?: boolean;
  /**
   * Pivot of the transforms, in icon units. Default is the icon's top left, which is right for the
   * matrices above; a part that only spins in place (the gear) gives its centre so it cannot drift.
   */
  origin?: string;
  children: ReactNode;
}) {
  return (
    <g
      className={cn("nav-icon-part", fixedStroke && "nav-icon-part-fixed")}
      style={
        {
          "--nav-rest": rest,
          "--nav-hover": hover,
          ...(origin ? { transformOrigin: origin } : {}),
        } as CSSProperties
      }
    >
      {children}
    </g>
  );
}

const shapes: Record<NavIconName, ReactNode> = {
  dashboard: (
    <>
      <rect x={3.333} y={3.335} width={5} height={5} />
      <Part rest={at(11.667, 3.335)} hover={m(0.707, 0.707, -0.707, 0.707, 14.167, 2.298)}>
        <rect width={5} height={5} />
      </Part>
      <rect x={3.333} y={11.665} width={5} height={5} />
      <circle cx={14.167} cy={14.165} r={2.5} />
    </>
  ),
  playground: (
    <>
      <Part rest={at(8.333, 2.5)} hover={m(0.995, 0.098, -0.098, 0.995, 9.631, 0.877)}>
        <path d="M 9.167 9.167 L 6.667 6.667 L 0.833 6.667 C 0.612 6.667 0.4 6.579 0.244 6.423 C 0.088 6.266 0 6.054 0 5.833 L 0 0.833 C 0 0.612 0.088 0.4 0.244 0.244 C 0.4 0.088 0.612 0 0.833 0 L 8.333 0 C 8.554 0 8.766 0.088 8.923 0.244 C 9.079 0.4 9.167 0.612 9.167 0.833 L 9.167 9.167 Z" />
      </Part>
      <Part rest={at(2.5, 8.331)} hover={m(0.997, -0.077, 0.077, 0.997, 1.442, 9.492)}>
        <path d="M 9.167 3.148 L 9.167 5.833 C 9.167 6.054 9.079 6.266 8.923 6.423 C 8.766 6.579 8.554 6.667 8.333 6.667 L 2.5 6.667 L 0 9.167 L 0 0.833 C 0 0.612 0.088 0.4 0.244 0.244 C 0.4 0.088 0.612 0 0.833 0 L 3.255 0" />
      </Part>
    </>
  ),
  "api-keys": (
    <>
      <Part rest={at(2.5, 2.5)} hover={m(0.899, 0.437, -0.437, 0.899, 6.535, -0.025)}>
        <path d="M 11.296 0.702 L 14.297 3.704 C 14.52 3.927 14.697 4.191 14.817 4.482 C 14.938 4.773 15 5.085 15 5.399 C 15 5.714 14.938 6.026 14.817 6.317 C 14.697 6.608 14.52 6.872 14.297 7.095 L 12.095 9.297 C 11.872 9.52 11.608 9.697 11.317 9.817 C 11.026 9.938 10.714 10 10.4 10 C 10.085 10 9.773 9.938 9.482 9.817 C 9.191 9.697 8.927 9.52 8.704 9.297 L 8.453 9.047 L 2.988 14.512 C 2.711 14.788 2.346 14.959 1.956 14.993 L 1.81 15 L 0.833 15 C 0.629 15 0.432 14.925 0.28 14.789 C 0.127 14.654 0.03 14.467 0.006 14.264 L 0 14.167 L 0 13.19 C 0 12.799 0.138 12.42 0.389 12.12 L 0.488 12.012 L 0.833 11.667 L 2.5 11.667 L 2.5 10 L 4.167 10 L 4.167 8.333 L 5.953 6.547 L 5.703 6.296 C 5.48 6.073 5.303 5.809 5.183 5.518 C 5.062 5.227 5 4.915 5 4.6 C 5 4.285 5.062 3.974 5.183 3.683 C 5.303 3.392 5.48 3.127 5.703 2.905 L 7.905 0.702 C 8.128 0.48 8.392 0.303 8.683 0.183 C 8.974 0.062 9.286 0 9.6 0 C 9.915 0 10.227 0.062 10.518 0.183 C 10.809 0.303 11.073 0.48 11.296 0.702 Z" />
      </Part>
      <Part rest={at(12.5, 7.5)} hover={m(0.899, 0.437, -0.437, 0.899, 13.342, 8.842)}>
        <path d="M0 0h.01" />
      </Part>
    </>
  ),
  usage: (
    <>
      <path d="M2.5 17.5h15" />
      <Part fixedStroke rest={grow(1, 17.502)} hover={grow(1.0925, 17.502)}>
        <path d="M15 17.502V5.835" />
      </Part>
      <Part rest={at(7.5, 10)} hover={at(7.5, 7.731)}>
        <path d="M0 2.5 2.5 0 5 2.5" />
      </Part>
      <Part rest={at(12.5, 5.835)} hover={at(12.5, 3.505)}>
        <path d="M0 2.5 2.5 0 5 2.5" />
      </Part>
      <Part fixedStroke rest={grow(1, 17.5)} hover={grow(1.1936, 17.5)}>
        <path d="M10 17.5V10" />
      </Part>
      <Part rest={at(2.5, 2.5)} hover={at(2.5, 11.289)}>
        <path d="M0 2.5 2.5 0 5 2.5" />
      </Part>
      <Part fixedStroke rest={grow(1, 17.5)} hover={grow(0.3307, 17.5)}>
        <path d="M5 17.5V2.5" />
      </Part>
    </>
  ),
  pricing: (
    <>
      <Part rest={at(4.167, 4.165)} hover={m(0.951, -0.309, 0.309, 0.951, 1.113, 5.518)}>
        <path d="M 3.333 0 L 1.667 0 C 1.225 0 0.801 0.176 0.488 0.488 C 0.176 0.801 0 1.225 0 1.667 L 0 11.667 C 0 12.109 0.176 12.533 0.488 12.845 C 0.801 13.158 1.225 13.333 1.667 13.333 L 10 13.333 C 10.442 13.333 10.866 13.158 11.179 12.845 C 11.491 12.533 11.667 12.109 11.667 11.667 L 11.667 1.667 C 11.667 1.225 11.491 0.801 11.179 0.488 C 10.866 0.176 10.442 0 10 0 L 8.333 0" />
      </Part>
      <Part rest={at(7.5, 2.5)} hover={m(0.951, -0.309, 0.309, 0.951, 3.648, 2.567)}>
        <path d="M 0 1.667 C 0 1.225 0.176 0.801 0.488 0.488 C 0.801 0.176 1.225 0 1.667 0 L 3.333 0 C 3.775 0 4.199 0.176 4.512 0.488 C 4.824 0.801 5 1.225 5 1.667 C 5 2.109 4.824 2.533 4.512 2.845 C 4.199 3.158 3.775 3.333 3.333 3.333 L 1.667 3.333 C 1.225 3.333 0.801 3.158 0.488 2.845 C 0.176 2.533 0 2.109 0 1.667 Z" />
      </Part>
      <Part rest={at(8.333, 9.165)} hover={m(0.951, -0.309, 0.309, 0.951, 6.619, 8.988)}>
        <path d="M 3.333 0 L 1.25 0 C 0.918 0 0.601 0.132 0.366 0.366 C 0.132 0.601 0 0.918 0 1.25 C 0 1.582 0.132 1.899 0.366 2.134 C 0.601 2.368 0.918 2.5 1.25 2.5 L 2.083 2.5 C 2.415 2.5 2.733 2.632 2.967 2.866 C 3.202 3.101 3.333 3.418 3.333 3.75 C 3.333 4.082 3.202 4.399 2.967 4.634 C 2.733 4.868 2.415 5 2.083 5 L 0 5" />
      </Part>
      <Part rest={at(10, 8.335)} hover={m(0.951, -0.309, 0.309, 0.951, 7.947, 7.681)}>
        <path d="M 0 5.833 L 0 6.667 M 0 0 L 0 0.833" />
      </Part>
    </>
  ),
  settings: (
    <>
      {/* Figma: the gear only spins about its centre (10, 10) while the centre dot fills. */}
      <Part origin="10px 10px" rest="rotate(0deg)" hover="rotate(71.58deg)">
        <path
          transform="translate(2.5 2.5)"
          d="M 6.104 1.098 C 6.459 -0.366 8.541 -0.366 8.896 1.098 C 8.949 1.317 9.054 1.521 9.201 1.693 C 9.348 1.865 9.533 2 9.742 2.086 C 9.951 2.173 10.178 2.209 10.403 2.192 C 10.629 2.174 10.847 2.104 11.04 1.986 C 12.326 1.202 13.798 2.674 13.015 3.961 C 12.897 4.154 12.827 4.372 12.81 4.597 C 12.792 4.823 12.828 5.049 12.915 5.258 C 13.001 5.467 13.136 5.652 13.307 5.799 C 13.479 5.946 13.683 6.051 13.903 6.104 C 15.366 6.459 15.366 8.541 13.903 8.896 C 13.683 8.949 13.479 9.054 13.307 9.201 C 13.135 9.348 13 9.533 12.914 9.742 C 12.827 9.951 12.791 10.178 12.808 10.403 C 12.826 10.629 12.896 10.847 13.014 11.04 C 13.798 12.326 12.326 13.798 11.039 13.015 C 10.846 12.897 10.628 12.827 10.403 12.81 C 10.177 12.792 9.951 12.828 9.742 12.915 C 9.533 13.001 9.348 13.136 9.201 13.307 C 9.054 13.479 8.949 13.683 8.896 13.903 C 8.541 15.366 6.459 15.366 6.104 13.903 C 6.051 13.683 5.946 13.479 5.799 13.307 C 5.652 13.135 5.467 13 5.258 12.914 C 5.049 12.827 4.822 12.791 4.597 12.808 C 4.371 12.826 4.153 12.896 3.96 13.014 C 2.674 13.798 1.202 12.326 1.985 11.039 C 2.103 10.846 2.173 10.628 2.19 10.403 C 2.208 10.177 2.172 9.951 2.085 9.742 C 1.999 9.533 1.864 9.348 1.693 9.201 C 1.521 9.054 1.317 8.949 1.098 8.896 C -0.366 8.541 -0.366 6.459 1.098 6.104 C 1.317 6.051 1.521 5.946 1.693 5.799 C 1.865 5.652 2 5.467 2.086 5.258 C 2.173 5.049 2.209 4.822 2.192 4.597 C 2.174 4.371 2.104 4.153 1.986 3.96 C 1.202 2.674 2.674 1.202 3.961 1.985 C 4.794 2.492 5.874 2.043 6.104 1.098 Z"
        />
      </Part>
      <circle className="nav-icon-fill" cx={10} cy={10} r={2.5} />
    </>
  ),
};

/** 20px nav icon: stroke 1.25, round caps and joins, `currentColor`. */
export function NavIcon({ name, className }: { name: NavIconName; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0", className)}
    >
      {shapes[name]}
    </svg>
  );
}
