import { type ModelPriceRow } from "@/types/domain";

/**
 * The Pricing table of the Figma "Plans & Pricing" screen: the eight models, their context windows
 * and prices in the order Figma lists them. This is its own list on purpose: the Compare Models
 * catalog holds placeholder prices and context windows that differ from these. "gemma-431B-it" in
 * Figma is written "gemma-4-31B-it" here, the model's ID everywhere else.
 */
export const modelPricingFixture: ModelPriceRow[] = [
  {
    id: "minimax-m2.7",
    name: "MiniMax-M2.7",
    contextWindow: 128_000,
    cachedInputPrice: 0.06,
    inputPrice: 0.6,
    outputPrice: 2.4,
  },
  {
    id: "deepseek-r1-distill-llama-70b",
    name: "Deepseek-R1-Distill-Llama-70B",
    contextWindow: 64_000,
    cachedInputPrice: null,
    inputPrice: 0.7,
    outputPrice: 1.4,
  },
  {
    id: "deepseek-v3.1-cb",
    name: "DeepSeek-V3.1-cb",
    contextWindow: 128_000,
    cachedInputPrice: null,
    inputPrice: 0.15,
    outputPrice: 0.75,
  },
  {
    id: "deepseek-v3.1",
    name: "DeepSeek-V3.1",
    contextWindow: 64_000,
    cachedInputPrice: null,
    inputPrice: 3,
    outputPrice: 4.5,
  },
  {
    id: "deepseek-v3.2",
    name: "DeepSeek-V3.2",
    contextWindow: 128_000,
    cachedInputPrice: null,
    inputPrice: 3,
    outputPrice: 4.5,
  },
  {
    id: "gemma-4-31b-it",
    name: "gemma-4-31B-it",
    contextWindow: 128_000,
    cachedInputPrice: null,
    inputPrice: 0.22,
    outputPrice: 0.59,
  },
  {
    id: "gpt-oss-120b",
    name: "gpt-oss-120b",
    contextWindow: 128_000,
    cachedInputPrice: null,
    inputPrice: 0.22,
    outputPrice: 0.59,
  },
  {
    id: "meta-llama-3.3-70b-instruct",
    name: "Meta-Llama-3.3-70B-Instruct",
    contextWindow: 120_000,
    cachedInputPrice: null,
    inputPrice: 0.6,
    outputPrice: 1.2,
  },
];
