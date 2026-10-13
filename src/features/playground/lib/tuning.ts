import { type CatalogModel, type ChatCompletionRequest, type TuningParams } from "@/types/domain";

/** Sampling on (Figma: Tuning Parameters `1398:119215`): temperature 0.7 + top_p 0.95; off = greedy. */
export const SAMPLING_TEMPERATURE = 0.7;
export const SAMPLING_TOP_P = 0.95;

/** Fallback Max Tokens ceiling while the catalog is unknown. */
export const DEFAULT_MAX_TOKENS_LIMIT = 128_000;

/** Tuning → request fields. `max_tokens` is omitted for 0 (model default) and capped at the model's max output. */
export function toRequestParams(
  tuning: TuningParams,
  model?: CatalogModel | null,
): Pick<ChatCompletionRequest, "temperature" | "top_p" | "max_tokens"> {
  const params: Pick<ChatCompletionRequest, "temperature" | "top_p" | "max_tokens"> = {
    temperature: tuning.sampling ? SAMPLING_TEMPERATURE : 0,
  };
  if (tuning.sampling) params.top_p = SAMPLING_TOP_P;
  if (tuning.maxTokens > 0) {
    params.max_tokens = model
      ? Math.min(tuning.maxTokens, model.features.maxOutput)
      : tuning.maxTokens;
  }
  return params;
}

/** Max Tokens ceiling: the smallest `features.maxOutput` of the active model(s), default 128 000. */
export function maxTokensLimit(models: readonly (CatalogModel | null | undefined)[]) {
  const limits = models.flatMap((model) => (model ? [model.features.maxOutput] : []));
  return limits.length > 0 ? Math.min(...limits) : DEFAULT_MAX_TOKENS_LIMIT;
}

/** Whole tokens between 0 and `limit`; anything unparsable becomes 0 (model default). */
export function clampMaxTokens(value: number, limit: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(0, Math.floor(value)), limit);
}
