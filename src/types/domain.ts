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

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  fullName: string;
  email: string;
  password: string;
}

/** Body of a successful login or sign-up. The session itself travels in the cookie. */
export interface AuthResponse {
  user: User;
}

export interface CreateProjectInput {
  name: string;
}

export interface BillingAddress {
  fullName: string;
  /** ISO 3166-1 alpha-2 code, e.g. "US". */
  country: string;
  address: string;
}

export interface CardDetails {
  number: string;
  /** MM/YY */
  expiry: string;
  cvc: string;
}

/** Credits belong to the user, not to a project. */
export interface PurchaseCreditsInput {
  /** Whole US dollars. */
  amount: number;
  billingAddress: BillingAddress;
  card: CardDetails;
}

export interface CreditPurchase {
  id: string;
  amount: number;
  createdAt: string;
}

export interface PurchaseCreditsResponse {
  /** The user's balance after the purchase, in USD. */
  balance: number;
  purchase: CreditPurchase;
}

/** How long the old secret keeps working after a rotation. */
export type GracePeriod = "immediately" | "1h" | "24h" | "3d" | "7d";

export interface RotateApiKeyInput {
  gracePeriod: GracePeriod;
}

/** Fields that can change on an existing key. */
export interface UpdateApiKeyInput {
  name?: string;
  status?: ApiKeyStatus;
}

export interface CreateApiKeyInput {
  name: string;
}

/** What the API returns when a key is created. `secret` is shown only this once; the UI does not display it yet. */
export interface CreatedApiKey extends ApiKey {
  secret: string;
}

export type ApiKeyStatus = "active" | "disabled";
export type ApiKeyStatusFilter = "all" | ApiKeyStatus;

/** Table state sent to `GET /projects/:id/api-keys`. */
export interface ApiKeyListParams {
  /** 1-based. */
  page: number;
  pageSize: number;
  /** Matches the key name or ID; empty means no search. */
  search: string;
  status: ApiKeyStatusFilter;
}

/** An API key as listed (the secret itself is only shown once, when it is created). */
export interface ApiKey {
  id: string;
  name: string;
  /** Last characters of the key, for recognising it in the list. */
  lastFour: string;
  status: ApiKeyStatus;
  createdAt: string;
  lastUsedAt: string | null;
  /** Set once the key has been renamed; the table marks such keys "Edited". */
  renamedAt?: string | null;
  /** Set when the key was rotated; the previous secret stops working at `previousKeyExpiresAt`. */
  rotatedAt?: string | null;
  previousKeyExpiresAt?: string | null;
}

/** A key with the extra details the usage page shows (`GET /projects/:id/api-keys/:keyId`). */
export interface ApiKeyDetail extends ApiKey {
  /** Name of the member who created the key. */
  createdBy: string;
}

/** Day range of the usage endpoints: local "YYYY-MM-DD" dates, both ends included. */
export interface UsageRangeParams {
  from: string;
  to: string;
}

/** Totals for one key over a day range (`GET .../api-keys/:keyId/usage`). */
export interface ApiKeyUsageStats {
  totalRequests: number;
  inputTokens: number;
  outputTokens: number;
  /** In USD. */
  estimatedSpend: number;
}

export type ApiKeyRequestStatus = "success" | "error";

export interface ApiKeyRequestError {
  /** HTTP status the request failed with. */
  code: number;
  /** Status text, e.g. "Service Unavailable". */
  title: string;
  message: string;
}

/** One request made with a key, as listed and as shown in the Request Details drawer. */
export interface ApiKeyRequestLog {
  id: string;
  requestedAt: string;
  model: string;
  responseTimeMs: number;
  status: ApiKeyRequestStatus;
  /** Token counts are `null` for failed requests, which are not billed. */
  inputTokens: number | null;
  outputTokens: number | null;
  cachedTokens: number | null;
  /** The prompt that was sent. */
  request: string;
  /** Start of the model's answer; `null` when the request failed. */
  responsePreview: string | null;
  error: ApiKeyRequestError | null;
}

/** Table state sent to `GET .../api-keys/:keyId/requests`. */
export interface ApiKeyRequestsParams extends UsageRangeParams {
  /** 1-based. */
  page: number;
  pageSize: number;
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

export interface ModelFeatures {
  /** Tokens the model can read in one request. */
  contextWindow: number;
  /** Tokens the model can generate in one response. */
  maxOutput: number;
  /** 0 to 5. */
  reasoning: number;
  speed: number;
  fastMode: boolean;
  adaptiveThinking: boolean;
  /** Year and month as "YYYY-MM". */
  knowledgeCutoff: string;
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
  /** Listed first in model pickers. */
  popular: boolean;
  description: string;
  pricing: ModelPricing;
  features: ModelFeatures;
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
