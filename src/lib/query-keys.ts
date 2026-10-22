import { type PaginationParams } from "@/lib/api";
import {
  type ApiKeyListParams,
  type ApiKeyRequestsParams,
  type ApiKeyUsageRowsParams,
  type UsageRangeParams,
} from "@/types/domain";

/**
 * Query key factory. Every key starts with its domain so a whole domain can
 * be invalidated at once, e.g. `queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })`.
 *
 * Project-scoped data lives under `queryKeys.project(projectId)` so switching
 * projects can invalidate everything that belongs to the previous project.
 */
export const queryKeys = {
  session: {
    all: ["session"] as const,
    me: () => [...queryKeys.session.all, "me"] as const,
  },
  billing: {
    all: ["billing"] as const,
    address: () => [...queryKeys.billing.all, "address"] as const,
  },
  projects: {
    all: ["projects"] as const,
    list: () => [...queryKeys.projects.all, "list"] as const,
    detail: (projectId: string) => [...queryKeys.projects.all, "detail", projectId] as const,
  },
  /** Root for everything that belongs to one project. */
  project: (projectId: string) => ["project", projectId] as const,
  models: {
    all: ["models"] as const,
    catalog: () => [...queryKeys.models.all, "catalog"] as const,
    recommended: () => [...queryKeys.models.all, "recommended"] as const,
  },
  marketing: {
    all: ["marketing"] as const,
    webinars: () => [...queryKeys.marketing.all, "webinars"] as const,
    partners: () => [...queryKeys.marketing.all, "partners"] as const,
  },
  apiKeys: {
    all: (projectId: string) => [...queryKeys.project(projectId), "api-keys"] as const,
    list: (projectId: string, params: ApiKeyListParams) =>
      [...queryKeys.apiKeys.all(projectId), "list", params] as const,
    detail: (projectId: string, keyId: string) =>
      [...queryKeys.apiKeys.all(projectId), "detail", keyId] as const,
    usage: (projectId: string, keyId: string, range: UsageRangeParams) =>
      [...queryKeys.apiKeys.all(projectId), "usage", keyId, range] as const,
    usageSeries: (projectId: string, keyId: string, range: UsageRangeParams) =>
      [...queryKeys.apiKeys.all(projectId), "usage-series", keyId, range] as const,
    requests: (projectId: string, keyId: string, params: ApiKeyRequestsParams) =>
      [...queryKeys.apiKeys.all(projectId), "requests", keyId, params] as const,
    // The Usage page adds up the project's keys, so changing a key refreshes it as well.
    projectUsage: (projectId: string, range: UsageRangeParams) =>
      [...queryKeys.apiKeys.all(projectId), "project-usage", range] as const,
    projectUsageSeries: (projectId: string, range: UsageRangeParams) =>
      [...queryKeys.apiKeys.all(projectId), "project-usage-series", range] as const,
    projectKeyUsage: (projectId: string, params: ApiKeyUsageRowsParams) =>
      [...queryKeys.apiKeys.all(projectId), "project-key-usage", params] as const,
  },
  usageOverview: (projectId: string) =>
    [...queryKeys.project(projectId), "usage-overview"] as const,
  examples: {
    all: (projectId: string) => [...queryKeys.project(projectId), "examples"] as const,
    list: (projectId: string, params: Required<PaginationParams>) =>
      [...queryKeys.examples.all(projectId), "list", params] as const,
  },
  playground: {
    /** Root for the Playground data of one project (history is per account + project). */
    all: (projectId: string) => [...queryKeys.project(projectId), "playground"] as const,
    conversations: (projectId: string) =>
      [...queryKeys.playground.all(projectId), "conversations"] as const,
    conversation: (projectId: string, conversationId: string) =>
      [...queryKeys.playground.conversations(projectId), conversationId] as const,
  },
};
