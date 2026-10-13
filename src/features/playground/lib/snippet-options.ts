import { type EndpointType, type SnippetOptions } from "@/features/dashboard";
import { type CatalogModel, type SystemPromptSetting, type TuningParams } from "@/types/domain";

import { toRequestParams } from "./tuning";

export interface SnippetOptionsInput {
  /** API id shown in the `model` field, e.g. "DeepSeek-V3.1". */
  apiId: string;
  /** Catalog entry of that model, used to cap `max_tokens` at its max output. */
  model?: CatalogModel | null;
  endpoint?: EndpointType;
  systemPrompt: SystemPromptSetting;
  tuning: TuningParams;
}

/**
 * Playground settings → `buildSnippet` options (Figma: View Code `1398:119330`). Only settings
 * that differ from the defaults appear, so a pristine Playground reproduces the Quickstart
 * sample: an empty prompt keeps the default system message, Sampling off adds no
 * `temperature` / `top_p`, and Max Tokens 0 (model default) adds no `max_tokens`.
 */
export function toSnippetOptions({
  apiId,
  model,
  endpoint = "chat",
  systemPrompt,
  tuning,
}: SnippetOptionsInput): SnippetOptions {
  const params = toRequestParams(tuning, model);
  const prompt = systemPrompt.prompt.trim();
  return {
    model: apiId,
    endpoint,
    systemPrompt: prompt || undefined,
    temperature: tuning.sampling ? params.temperature : undefined,
    topP: params.top_p,
    maxTokens: params.max_tokens,
  };
}
