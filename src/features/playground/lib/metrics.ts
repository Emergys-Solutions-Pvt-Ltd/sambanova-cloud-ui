import { type ChatCompletionUsage, type ReplyMetrics } from "@/types/domain";

/** Client-side timings of one stream, all from `performance.now()` (ms). */
export interface StreamTiming {
  t0: number;
  /** First non-empty delta; null when no token arrived. */
  tFirst: number | null;
  tEnd: number;
  chunkCount: number;
}

/**
 * Reply metrics (Figma: response footer `1398:122206`). Prefers server timings
 * (SambaNova usage fields); otherwise client measurements from performance.now().
 * Undefined when no token arrived.
 */
export function computeReplyMetrics(
  timing: StreamTiming,
  usage?: ChatCompletionUsage | null,
): ReplyMetrics | undefined {
  const { t0, tFirst, tEnd, chunkCount } = timing;
  if (tFirst === null) return undefined;

  const completionTokens = usage?.completion_tokens ?? chunkCount;
  return {
    completionTokens,
    firstTokenSeconds: usage?.time_to_first_token ?? (tFirst - t0) / 1000,
    totalSeconds: usage?.total_latency ?? (tEnd - t0) / 1000,
    tokensPerSecond:
      usage?.completion_tokens_after_first_per_sec ??
      completionTokens / Math.max((tEnd - tFirst) / 1000, 0.001),
  };
}

/** Footer strings (Figma: `202.23` t/s · `8.79s` total duration · `0.82s` to first token). */
export function formatMetrics(metrics: ReplyMetrics) {
  return {
    tps: metrics.tokensPerSecond.toFixed(2),
    total: `${metrics.totalSeconds.toFixed(2)}s`,
    ttft: `${metrics.firstTokenSeconds.toFixed(2)}s`,
  };
}
