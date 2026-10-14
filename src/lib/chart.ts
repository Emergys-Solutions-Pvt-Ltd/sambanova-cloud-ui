/** Geometry helpers for the SVG line charts: a readable y scale and a smooth curve through the points. */

export interface ChartScale {
  /** Distance between two gridlines. */
  step: number;
  /** Value at the top gridline. */
  max: number;
  /** Tick values from 0 to `max`, `intervals + 1` of them. */
  ticks: number[];
}

const STEP_MULTIPLES = [1, 2, 2.5, 5, 10] as const;

/**
 * Smallest "nice" step (1, 2, 2.5 or 5 times a power of ten) whose `intervals` steps reach `max`:
 * 6.4M over 5 intervals gives 2M (0, 2M ... 10M). With no data the axis reads 0 to 1K.
 */
export function niceScale(max: number, intervals = 5): ChartScale {
  const target = max > 0 ? max : 1_000;
  const rawStep = target / intervals;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const step =
    (STEP_MULTIPLES.find((multiple) => multiple * magnitude >= rawStep) ?? 10) * magnitude;
  return {
    step,
    max: step * intervals,
    ticks: Array.from({ length: intervals + 1 }, (_, index) => step * index),
  };
}

export interface ChartPoint {
  x: number;
  y: number;
}

const sign = (value: number) => (value < 0 ? -1 : 1);

/** Slope at an inner point so the curve never overshoots its neighbours (monotone cubic, Fritsch-Carlson). */
function innerSlope(previous: ChartPoint, point: ChartPoint, next: ChartPoint) {
  const h0 = point.x - previous.x;
  const h1 = next.x - point.x;
  const s0 = (point.y - previous.y) / h0;
  const s1 = (next.y - point.y) / h1;
  const average = (s0 * h1 + s1 * h0) / (h0 + h1);
  return (sign(s0) + sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(average)) || 0;
}

/**
 * Slope at an end point of the segment `left` to `right`: pass the end point's neighbour's slope
 * as `otherSlope`. Used for the first point (left) and the last point (right).
 */
const endSlope = (left: ChartPoint, right: ChartPoint, otherSlope: number) =>
  (3 * ((right.y - left.y) / (right.x - left.x)) - otherSlope) / 2;

/**
 * SVG path through the points as a smooth curve that stays between neighbouring values (a flat
 * stretch stays flat and a zero never dips below the axis). `points` must be sorted by `x`.
 */
export function smoothPath(points: ChartPoint[]): string {
  if (points.length === 0) return "";
  const [first, second] = points;
  if (!first || !second) return `M${first!.x} ${first!.y}`;
  if (points.length === 2) return `M${first.x} ${first.y}L${second.x} ${second.y}`;

  const slopes = points.map((point, index) => {
    const previous = points[index - 1];
    const next = points[index + 1];
    return previous && next ? innerSlope(previous, point, next) : 0;
  });
  const last = points.length - 1;
  slopes[0] = endSlope(first, second, slopes[1]!);
  slopes[last] = endSlope(points[last - 1]!, points[last]!, slopes[last - 1]!);

  let path = `M${first.x} ${first.y}`;
  for (let index = 1; index < points.length; index += 1) {
    const from = points[index - 1]!;
    const to = points[index]!;
    const third = (to.x - from.x) / 3;
    path +=
      `C${from.x + third} ${from.y + third * slopes[index - 1]!}` +
      ` ${to.x - third} ${to.y - third * slopes[index]!}` +
      ` ${to.x} ${to.y}`;
  }
  return path;
}
