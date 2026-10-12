import {
  type CloudPartner,
  type RecommendedModel,
  type UsageOverview,
  type Webinar,
} from "@/types/domain";

export { modelCatalogFixture } from "./model-catalog";

export const usageOverviewFixture: UsageOverview = {
  tokensUsed: 0,
  apiRequests: 0,
  activeApiKeys: 0,
};

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
