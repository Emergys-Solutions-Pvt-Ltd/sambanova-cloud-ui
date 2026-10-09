import {
  type CatalogModel,
  type CloudPartner,
  type RecommendedModel,
  type UsageOverview,
  type Webinar,
} from "@/types/domain";

export const usageOverviewFixture: UsageOverview = {
  tokensUsed: 0,
  apiRequests: 0,
  activeApiKeys: 0,
  creditsRemaining: 25,
};

/** Names match the Playground model dropdown in Figma; prices are placeholders except the two Figma shows. */
export const modelCatalogFixture: CatalogModel[] = [
  {
    id: "deepseek-v3.1",
    apiId: "DeepSeek-V3.1",
    name: "DeepSeek V3.1",
    brand: "deepseek",
    category: "reasoning",
    description:
      "Advanced coding and software development with strong reasoning and fast response times.",
    pricing: {
      input: 5,
      output: 25,
      promptCaching: { write: 6.25, read: 0.5 },
      fastMode: { input: 10, output: 50 },
      badge: "Best for Coding",
    },
  },
  {
    id: "deepseek-v3.2",
    apiId: "DeepSeek-V3.2",
    name: "DeepSeek V3.2",
    brand: "deepseek",
    category: "reasoning",
    description: "Next-generation DeepSeek with improved reasoning and longer context handling.",
    pricing: {
      input: 5.5,
      output: 26,
      promptCaching: { write: 6.5, read: 0.55 },
      fastMode: { input: 11, output: 52 },
    },
  },
  {
    id: "gpt-oss-120b",
    apiId: "gpt-oss-120b",
    name: "GPT-OSS-120B",
    brand: "openai",
    category: "reasoning",
    description: "Open-weight reasoning model for agentic and coding workloads.",
    pricing: {
      input: 3,
      output: 4.5,
      promptCaching: { write: 3.75, read: 0.3 },
      fastMode: { input: 6, output: 9 },
    },
  },
  {
    id: "llama-3.3-70b",
    apiId: "Meta-Llama-3.3-70B-Instruct",
    name: "Meta-Llama-3.3-70B-Instruct",
    brand: "meta",
    category: "text",
    description: "Multilingual instruction-tuned model for dialogue and general text tasks.",
    pricing: {
      input: 0.6,
      output: 1.2,
      promptCaching: { write: 0.75, read: 0.06 },
      fastMode: { input: 1.2, output: 2.4 },
    },
  },
  {
    id: "minimax-m2.7",
    apiId: "Minimax-M2.7",
    name: "MiniMax M2.7",
    brand: "minimax",
    category: "text",
    description:
      "Process large documents, lengthy conversations, and complex workflows with extended context support.",
    pricing: {
      input: 2,
      output: 20,
      promptCaching: { write: 3.25, read: 0.5 },
      fastMode: { input: 5, output: 20 },
      badge: "Cheapest Model",
    },
  },
  {
    id: "gemma-4-31b",
    apiId: "gemma-4-31B-it",
    name: "Gemma 3",
    brand: "gemma",
    category: "image-text",
    description: "Lightweight multimodal model that understands images and text.",
    pricing: {
      input: 0.4,
      output: 0.8,
      promptCaching: { write: 0.5, read: 0.04 },
      fastMode: { input: 0.8, output: 1.6 },
    },
  },
];

export const recommendedModelsFixture: RecommendedModel[] = [
  {
    modelId: "deepseek-v3.1",
    name: "DeepSeek V3.1",
    brand: "deepseek",
    description:
      "Advanced coding and software development with strong reasoning and fast response times.",
    reasoning: 4,
    speed: 5,
    contextWindow: "128K",
    priceLabel: "$3.00 / $4.50 per 1M",
    glow: "indigo",
  },
  {
    modelId: "minimax-m2.7",
    name: "MiniMax M2.7",
    brand: "minimax",
    description:
      "Process large documents, lengthy conversations, and complex workflows with extended context support.",
    reasoning: 5,
    speed: 4,
    contextWindow: "128K",
    priceLabel: "$3.00 / $4.50 per 1M",
    glow: "sky",
  },
  {
    modelId: "gemma-4-31b",
    name: "Gemma 3",
    brand: "gemma",
    description:
      "Advanced coding and software development with strong reasoning and fast response times.",
    reasoning: 4,
    speed: 3,
    contextWindow: "128K",
    priceLabel: "$3.00 / $4.50 per 1M",
    glow: "gemma",
  },
  {
    modelId: "gpt-oss-120b",
    name: "GPT-OSS-120B",
    brand: "openai",
    description:
      "Advanced coding and software development with strong reasoning and fast response times.",
    reasoning: 5,
    speed: 5,
    contextWindow: "128K",
    priceLabel: "$3.00 / $4.50 per 1M",
    glow: "teal",
  },
];

export const webinarsFixture: Webinar[] = [
  {
    id: "wbn_production-ai",
    title: "Build Production AI Apps with SambaNova",
    description:
      "Join our experts to learn best practices, real-world use cases and platform updates.",
    startsAt: "2026-07-12T11:00:00",
    host: "SambaNova Team",
    registerUrl: "https://sambanova.ai/events",
  },
  {
    id: "wbn_agents",
    title: "Building Fast Agents on SambaNova Cloud",
    description:
      "See how to combine fast inference, tool calling and long context to ship reliable agents.",
    startsAt: "2026-07-26T16:30:00",
    host: "SambaNova Developer Relations",
    registerUrl: "https://sambanova.ai/events",
  },
  {
    id: "wbn_cost",
    title: "Optimizing Cost and Latency for LLM Workloads",
    description:
      "Learn how prompt caching and fast mode change the cost and speed profile of your app.",
    startsAt: "2026-08-09T10:00:00",
    host: "SambaNova Solutions Engineering",
    registerUrl: "https://sambanova.ai/events",
  },
];

export const partnersFixture: CloudPartner[] = [
  {
    id: "infercom",
    name: "Infercom",
    description: "High performance GPU cloud infrastructure for AI workloads.",
    url: "https://sambanova.ai/partners",
  },
  {
    id: "argylldata",
    name: "ArgyllData",
    description: "Secure, scalable cloud platform built for developers.",
    url: "https://sambanova.ai/partners",
  },
  {
    id: "scx",
    name: "SCX",
    description: "Enterprise-grade GPU cloud for AI training and interference.",
    url: "https://sambanova.ai/partners",
  },
];
