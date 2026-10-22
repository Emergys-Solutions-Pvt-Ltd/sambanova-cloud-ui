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
  /** Dashboard asks for it; Billing doesn't (the API falls back to the saved address). */
  billingAddress?: BillingAddress;
  card: CardDetails;
}

/* ---- Billing (account level, shown under Project Settings › Billing) ---- */

export type CardBrand = "visa" | "mastercard" | "amex" | "discover";

/** A saved card. Only the brand, last 4 digits and expiry are ever stored or returned. */
export interface PaymentMethod {
  id: string;
  brand: CardBrand;
  last4: string;
  /** 1-12. */
  expMonth: number;
  /** Four digits. */
  expYear: number;
  createdAt: string;
}

export interface AddPaymentMethodInput {
  card: CardDetails;
}

/** Auto Recharge: when the balance drops below `threshold`, buy `amount` with the chosen card. */
export interface AutoRechargeSettings {
  enabled: boolean;
  /** Whole US dollars; `null` until first set up. */
  threshold: number | null;
  amount: number | null;
  paymentMethodId: string | null;
}

/** PUT /billing/auto-recharge. Enabling needs all three values; disabling keeps them. */
export interface UpdateAutoRechargeInput {
  enabled: boolean;
  threshold?: number;
  amount?: number;
  paymentMethodId?: string;
}

export type InvoiceStatus = "completed" | "failed";

export interface Invoice {
  id: string;
  /** Display number, e.g. "Inv-0212". */
  number: string;
  createdAt: string;
  /** US dollars. */
  amount: number;
  status: InvoiceStatus;
  /** What it was for: a manual purchase or an automatic recharge. */
  source: "purchase" | "auto-recharge";
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

/** Token usage of one key on one day, for the charts (`GET .../api-keys/:keyId/usage/series`). */
export interface ApiKeyUsageSeriesPoint {
  /** Local day, "YYYY-MM-DD". */
  date: string;
  inputTokens: number;
  outputTokens: number;
  /** The part of the input served from cache. */
  cachedTokens: number;
}

/** Every day of the requested range in order, days without requests included (all zeros). */
export interface ApiKeyUsageSeries {
  points: ApiKeyUsageSeriesPoint[];
}

/** One line of the Usage page's "API Key Usage" table: a key and what it did in the range. */
export interface ApiKeyUsageRow {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
  totalRequests: number;
  /** In USD. */
  estimatedSpend: number;
}

/** Table state sent to `GET /projects/:projectId/usage/api-keys`. */
export interface ApiKeyUsageRowsParams extends UsageRangeParams {
  /** 1-based. */
  page: number;
  pageSize: number;
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

/* ---- Project Settings ---- */

/** Role of a user inside one project. Each project has exactly one owner (its creator). */
export type ProjectRole = "owner" | "admin" | "developer" | "viewer";
/** Roles that can be given to someone; ownership is not transferable in this release. */
export type AssignableRole = Exclude<ProjectRole, "owner">;

/** Feature areas a role or member is granted access to (Figma: Edit Permissions rows). */
export type PermissionArea =
  "models" | "playground" | "agenticAi" | "apiKeys" | "projects" | "usage" | "billing";
export type PermissionLevel = "manage" | "use" | "view" | "none";
export type PermissionSet = Record<PermissionArea, PermissionLevel>;

export interface ProjectPerson {
  name: string;
  email: string;
}

/** GET /projects/:id. A superset of `Project`. */
export interface ProjectDetails extends Project {
  description: string;
  createdBy: ProjectPerson;
  memberCount: number;
  updatedAt: string;
  /** The signed-in user's role here; decides which controls the settings show. */
  myRole: ProjectRole;
}

/** PATCH /projects/:id. Only the fields sent change. */
export interface UpdateProjectInput {
  name?: string;
  description?: string;
}

export interface ProjectMember {
  /** Membership id (not the user id). */
  id: string;
  name: string;
  email: string;
  role: ProjectRole;
  joinedAt: string;
  /** Effective permissions: the role's defaults with this member's own changes applied. */
  permissions: PermissionSet;
  /** True when the member's permissions differ from their role's defaults. */
  customPermissions: boolean;
  /** True for the signed-in user's own membership. */
  isYou: boolean;
}

/** PATCH /projects/:id/members/:memberId. A role change resets custom permissions. */
export interface UpdateMemberInput {
  role?: AssignableRole;
  permissions?: PermissionSet;
}

export type InvitationStatus = "pending" | "expired";

export interface ProjectInvitation {
  id: string;
  email: string;
  role: AssignableRole;
  invitedAt: string;
  expiresAt: string;
  /** Derived from `expiresAt` by the API. */
  status: InvitationStatus;
}

export interface CreateInvitationInput {
  email: string;
  role: AssignableRole;
}

/** Query of the paginated Members and Invitations tables. */
export interface SettingsListParams {
  page: number;
  pageSize: number;
  /** Case-insensitive match on name or email. */
  search: string;
}

/** A role as configured in one project (Figma: Roles cards). */
export interface ProjectRoleDefinition {
  id: ProjectRole;
  name: string;
  /** Pill next to the name, e.g. "Highest Privilege". */
  badge: string;
  description: string;
  permissions: PermissionSet;
  /** False for Owner: its permissions are fixed. */
  editable: boolean;
  memberCount: number;
}

export interface UpdateRoleInput {
  permissions: PermissionSet;
}

export interface UsageTier {
  /** 0-based tier number. */
  level: number;
  /** Lifetime spend (USD) that unlocks the tier. */
  threshold: number;
}

export interface ModelRateLimit {
  modelId: string;
  modelName: string;
  requestsPerMinute: number;
  /** Excludes cache reads. */
  inputTokensPerMinute: number;
  outputTokensPerMinute: number;
}

/** GET /projects/:id/limits. */
export interface ProjectLimits {
  tiers: UsageTier[];
  currentTier: number;
  /** Lifetime spend in USD that the tier is based on. */
  spend: number;
  rateLimits: ModelRateLimit[];
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

/** One line of the Pricing table (`GET /models/pricing`); prices are USD per million tokens. */
export interface ModelPriceRow {
  id: string;
  name: string;
  /** Tokens the model can read in one request. */
  contextWindow: number;
  /** Price of cached input tokens; `null` for a model without prompt caching ("N/A"). */
  cachedInputPrice: number | null;
  inputPrice: number;
  outputPrice: number;
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

/* ---- Chat completions (OpenAI-compatible wire format; snake_case on purpose) ---- */

export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

/** Body of POST /v1/chat/completions. `stream` and `stream_options` are added by the API function. */
export interface ChatCompletionRequest {
  /** `CatalogModel.apiId`. */
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
}

/** Provisional: SambaNova adds timing fields (seconds, tokens per second) to the final usage chunk. */
export interface ChatCompletionUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  time_to_first_token?: number;
  total_latency?: number;
  completion_tokens_after_first_per_sec?: number;
}

export type ChatFinishReason = "stop" | "length";

export interface ChatCompletionChunk {
  id: string;
  object: "chat.completion.chunk";
  created: number;
  model: string;
  /** Empty in the trailing usage-only chunk (`stream_options.include_usage`): always read `choices[0]?.…`. */
  choices: {
    index: number;
    delta: { role?: ChatRole; content?: string };
    finish_reason: ChatFinishReason | null;
  }[];
  usage?: ChatCompletionUsage | null;
}

/* ---- Playground ---- */

export type PlaygroundMode = "single" | "compare";
/** Column of a compare thread; single chat always uses "a". */
export type CompareSlot = "a" | "b";
export type QuickRoleId = "developer" | "technical-writer" | "product-manager";

/** Global system prompt ("applied for all the sessions"). `roleId` is null for a custom prompt. */
export interface SystemPromptSetting {
  roleId: QuickRoleId | null;
  prompt: string;
}

export interface TuningParams {
  /** On: temperature 0.7 / top_p 0.95. Off: greedy (temperature 0). */
  sampling: boolean;
  /** 0 = model default (max_tokens omitted). */
  maxTokens: number;
}

export interface ReplyMetrics {
  tokensPerSecond: number;
  totalSeconds: number;
  firstTokenSeconds: number;
  completionTokens: number;
}

export type ReplyStatus = "pending" | "streaming" | "done" | "stopped" | "error";

export interface ReplyError {
  status: number;
  code: string;
  message: string;
}

export interface AssistantReply {
  /** `CatalogModel.id` that produced the reply. */
  modelId: string;
  status: ReplyStatus;
  /** Client-only id of the stream that owns this reply ("run_xxxxxxxx"); stale streams no-op on mismatch. Omitted when saving. */
  runId?: string;
  /** Markdown source. */
  content: string;
  metrics?: ReplyMetrics;
  finishReason?: ChatFinishReason;
  error?: ReplyError;
}

export interface ConversationTurn {
  id: string;
  prompt: string;
  /** ISO timestamp. */
  createdAt: string;
  replies: Partial<Record<CompareSlot, AssistantReply>>;
}

export interface Conversation {
  id: string;
  title: string;
  mode: PlaygroundMode;
  /** `CatalogModel.id` per slot; single chat uses "a". */
  models: Partial<Record<CompareSlot, string>>;
  systemPrompt: string;
  turns: ConversationTurn[];
  createdAt: string;
  updatedAt: string;
}

export type ConversationSummary = Pick<Conversation, "id" | "title" | "mode" | "updatedAt">;

/** PUT body (create-or-replace). Only settled replies (done | stopped | error) are saved. */
export type SaveConversationInput = Pick<
  Conversation,
  "title" | "mode" | "models" | "systemPrompt" | "turns" | "createdAt"
>;

export interface RenameConversationInput {
  title: string;
}
