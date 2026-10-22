import {
  type AssignableRole,
  type ModelRateLimit,
  type PermissionArea,
  type PermissionLevel,
  type PermissionSet,
  type ProjectRole,
  type UsageTier,
} from "@/types/domain";

/**
 * Project Settings mock data. Names, roles and limits follow the Figma frames
 * (Members `1387:66063`, Roles `1387:66321`, Limits `1387:66468`); everything Figma leaves
 * open is an assumption listed in the "Project Settings — Assumptions, Gaps & Audit Log" doc.
 */

/** Levels each area accepts, as drawn in Edit Permissions (`1387:66713`). The UI mirrors this. */
export const ALLOWED_LEVELS: Record<PermissionArea, readonly PermissionLevel[]> = {
  models: ["use", "view", "none"],
  playground: ["use", "none"],
  agenticAi: ["use", "none"],
  apiKeys: ["manage", "view", "none"],
  projects: ["manage", "view", "none"],
  usage: ["view", "none"],
  billing: ["manage", "view", "none"],
};

/** Default permissions per role. Developer is the set shown in the Figma dialog; the rest are assumed. */
export const ROLE_DEFAULTS: Record<ProjectRole, PermissionSet> = {
  owner: {
    models: "use",
    playground: "use",
    agenticAi: "use",
    apiKeys: "manage",
    projects: "manage",
    usage: "view",
    billing: "manage",
  },
  admin: {
    models: "use",
    playground: "use",
    agenticAi: "use",
    apiKeys: "manage",
    projects: "manage",
    usage: "view",
    billing: "view",
  },
  developer: {
    models: "use",
    playground: "use",
    agenticAi: "use",
    apiKeys: "manage",
    projects: "view",
    usage: "view",
    billing: "none",
  },
  viewer: {
    models: "view",
    playground: "none",
    agenticAi: "none",
    apiKeys: "view",
    projects: "view",
    usage: "view",
    billing: "none",
  },
};

/** Card copy. Badges are Figma's; Figma repeats the Owner description on every card, so the others are ours. */
export const ROLE_META: Record<ProjectRole, { name: string; badge: string; description: string }> =
  {
    owner: {
      name: "Owner",
      badge: "Highest Privilege",
      description: "Full access to all project features and administration.",
    },
    admin: {
      name: "Admin",
      badge: "Manage",
      description: "Manages members, API keys and project settings.",
    },
    developer: {
      name: "Developer",
      badge: "Limited Access",
      description: "Builds with models, the Playground and API keys.",
    },
    viewer: {
      name: "Viewer",
      badge: "View Only",
      description: "Sees project resources and usage without changing them.",
    },
  };

export const PROJECT_ROLES: readonly ProjectRole[] = ["owner", "admin", "developer", "viewer"];

/** Invitations stay valid this long (Figma shows no period). */
export const INVITATION_TTL_DAYS = 7;

/** Descriptions of the shared fixture projects; created projects start without one. */
export const PROJECT_DESCRIPTIONS: Record<string, string> = {
  prj_default: "Production APIs for customer facing applications and internal services.",
  prj_chatbot: "Customer support assistant answering questions from the help center.",
  prj_rag: "Retrieval pipeline that grounds answers in the product documentation.",
  prj_eval: "Benchmarks and side-by-side evaluations of candidate models.",
};

/** The six teammates of the Figma members table; the signed-in user is added as Owner. */
export const SEED_TEAMMATES: {
  name: string;
  email: string;
  role: AssignableRole;
  /** Joined this many minutes after the project was created. */
  joinedAfterMinutes: number;
}[] = [
  {
    name: "Emily Davis",
    email: "emilydavis@company.com",
    role: "developer",
    joinedAfterMinutes: 4_590,
  },
  {
    name: "Sarah Johnson",
    email: "sarahjohnson@company.com",
    role: "developer",
    joinedAfterMinutes: 1_485,
  },
  {
    name: "Michael Thompson",
    email: "michaelthompson12@company.com",
    role: "viewer",
    joinedAfterMinutes: 5_765,
  },
  { name: "Rob Snow", email: "rob.snow1@company.com", role: "developer", joinedAfterMinutes: 60 },
  {
    name: "David Smith",
    email: "davidsmith38786@company.com",
    role: "viewer",
    joinedAfterMinutes: 3_015,
  },
  {
    name: "Jason White",
    email: "jasonwhite23@company.com",
    role: "developer",
    joinedAfterMinutes: 3_016,
  },
];

/**
 * Invitations of the Figma table, re-addressed: Figma invites people who are already members
 * (and one email twice), which the API refuses. Days are relative to "now" so statuses stay live.
 */
export const SEED_INVITATIONS: { email: string; role: AssignableRole; invitedDaysAgo: number }[] = [
  { email: "olivia.martin@company.com", role: "admin", invitedDaysAgo: 1 },
  { email: "liam.carter@company.com", role: "developer", invitedDaysAgo: 2 },
  { email: "noah.patel@company.com", role: "developer", invitedDaysAgo: 4 },
  { email: "ava.nguyen@company.com", role: "viewer", invitedDaysAgo: 12 },
  { email: "ethan.brooks@company.com", role: "developer", invitedDaysAgo: 15 },
];

/** Usage Tiers (Figma `1387:66486`): lifetime spend in USD that unlocks each tier. */
export const USAGE_TIERS: UsageTier[] = [
  { level: 0, threshold: 0 },
  { level: 1, threshold: 50 },
  { level: 2, threshold: 250 },
  { level: 3, threshold: 500 },
  { level: 4, threshold: 1000 },
];

/**
 * Per-model limits. Figma's five rows first (its "Gemma 3" is the catalog's Gemma model), then
 * the remaining catalog models with assumed values. Figma shows one set only, so every tier
 * gets the same numbers.
 */
export const RATE_LIMITS: Omit<ModelRateLimit, "modelName">[] = [
  {
    modelId: "deepseek-v3.1",
    requestsPerMinute: 1_000,
    inputTokensPerMinute: 500_000,
    outputTokensPerMinute: 80_000,
  },
  {
    modelId: "minimax-m2.7",
    requestsPerMinute: 1_000,
    inputTokensPerMinute: 500_000,
    outputTokensPerMinute: 80_000,
  },
  {
    modelId: "gpt-oss-120b",
    requestsPerMinute: 50,
    inputTokensPerMinute: 100_000,
    outputTokensPerMinute: 20_000,
  },
  {
    modelId: "gemma-4-31b",
    requestsPerMinute: 1_000,
    inputTokensPerMinute: 500_000,
    outputTokensPerMinute: 80_000,
  },
  {
    modelId: "deepseek-v3.2",
    requestsPerMinute: 1_000,
    inputTokensPerMinute: 500_000,
    outputTokensPerMinute: 80_000,
  },
  {
    modelId: "deepseek-v4-pro",
    requestsPerMinute: 500,
    inputTokensPerMinute: 250_000,
    outputTokensPerMinute: 40_000,
  },
  {
    modelId: "minimax-m3",
    requestsPerMinute: 1_000,
    inputTokensPerMinute: 500_000,
    outputTokensPerMinute: 80_000,
  },
  {
    modelId: "llama-3.3-70b",
    requestsPerMinute: 1_000,
    inputTokensPerMinute: 500_000,
    outputTokensPerMinute: 80_000,
  },
];
