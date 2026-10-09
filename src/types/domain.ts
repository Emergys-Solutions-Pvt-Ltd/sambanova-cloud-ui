/**
 * Domain models. Shapes are provisional until the SambaNova API contract is
 * published; keep the mocks in src/mocks/fixtures in sync with these.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  /** Remaining prepaid credit, in USD. */
  creditBalance: number;
}

export interface Project {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
}

/** Placeholder resource used to demonstrate the paginated query + mutation pattern. */
export interface ExampleItem {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
}

export interface CreateExampleItemInput {
  name: string;
}

/** Headline numbers on the dashboard "Usage Overview" row, scoped to one project. */
export interface UsageOverview {
  tokensUsed: number;
  apiRequests: number;
  activeApiKeys: number;
  /** Remaining prepaid credit, in USD. */
  creditsRemaining: number;
}

export type ModelCategory = "reasoning" | "text" | "image-text";

/** USD per million tokens ("MTok"). */
export interface ModelPricing {
  input: number;
  output: number;
  promptCaching: { write: number; read: number };
  fastMode: { input: number; output: number };
  /** Short highlight shown under the price table, for example "Best for Coding". */
  badge?: string;
}

export interface CatalogModel {
  id: string;
  /** Value sent as `model` in API requests. */
  apiId: string;
  /** Display name. */
  name: string;
  /** Key into the brand artwork (deepseek, minimax, gemma, openai); anything else shows an initial. */
  brand: string;
  category: ModelCategory;
  description: string;
  pricing: ModelPricing;
}

export type ModelGlow = "indigo" | "sky" | "teal" | "gemma";

export interface RecommendedModel {
  modelId: string;
  name: string;
  brand: string;
  description: string;
  /** 0 to 5 segments. */
  reasoning: number;
  speed: number;
  contextWindow: string;
  /** Pre-formatted, for example "$3.00 / $4.50 per 1M". */
  priceLabel: string;
  glow: ModelGlow;
}

export interface Webinar {
  id: string;
  title: string;
  description: string;
  /** ISO 8601 start time. */
  startsAt: string;
  host: string;
  registerUrl: string;
}

export interface CloudPartner {
  id: "infercom" | "argylldata" | "scx";
  name: string;
  description: string;
  url: string;
}
