export type ChartTone = "input" | "output" | "cached" | "prompt";

/** Class names per series color; written out in full so Tailwind finds them. */
export const chartTones: Record<ChartTone, { text: string; stroke: string; fill: string }> = {
  input: { text: "text-chart-input", stroke: "stroke-chart-input", fill: "fill-chart-input" },
  output: { text: "text-chart-output", stroke: "stroke-chart-output", fill: "fill-chart-output" },
  cached: { text: "text-chart-cached", stroke: "stroke-chart-cached", fill: "fill-chart-cached" },
  prompt: { text: "text-chart-prompt", stroke: "stroke-chart-prompt", fill: "fill-chart-prompt" },
};
