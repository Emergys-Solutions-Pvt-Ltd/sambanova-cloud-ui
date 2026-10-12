import { type PaginationParams } from "@/lib/api";

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
  usageOverview: (projectId: string) =>
    [...queryKeys.project(projectId), "usage-overview"] as const,
  examples: {
    all: (projectId: string) => [...queryKeys.project(projectId), "examples"] as const,
    list: (projectId: string, params: Required<PaginationParams>) =>
      [...queryKeys.examples.all(projectId), "list", params] as const,
  },
};
