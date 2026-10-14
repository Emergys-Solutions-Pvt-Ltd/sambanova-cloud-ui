import { type PaginationParams } from "@/lib/api";
import {
  type ApiKeyListParams,
  type ApiKeyRequestsParams,
  type SettingsListParams,
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
  },
  usageOverview: (projectId: string) =>
    [...queryKeys.project(projectId), "usage-overview"] as const,
  examples: {
    all: (projectId: string) => [...queryKeys.project(projectId), "examples"] as const,
    list: (projectId: string, params: Required<PaginationParams>) =>
      [...queryKeys.examples.all(projectId), "list", params] as const,
  },
  settings: {
    /** Root for the Project Settings data of one project. */
    all: (projectId: string) => [...queryKeys.project(projectId), "settings"] as const,
    members: (projectId: string) => [...queryKeys.settings.all(projectId), "members"] as const,
    memberList: (projectId: string, params: SettingsListParams) =>
      [...queryKeys.settings.members(projectId), params] as const,
    invitations: (projectId: string) =>
      [...queryKeys.settings.all(projectId), "invitations"] as const,
    invitationList: (projectId: string, params: SettingsListParams) =>
      [...queryKeys.settings.invitations(projectId), params] as const,
    roles: (projectId: string) => [...queryKeys.settings.all(projectId), "roles"] as const,
    limits: (projectId: string) => [...queryKeys.settings.all(projectId), "limits"] as const,
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
