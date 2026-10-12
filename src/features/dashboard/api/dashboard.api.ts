import { apiClient } from "@/lib/api";
import {
  type CatalogModel,
  type CloudPartner,
  type RecommendedModel,
  type UsageOverview,
  type Webinar,
} from "@/types/domain";

export async function getUsageOverview(projectId: string, signal?: AbortSignal) {
  const { data } = await apiClient.get<UsageOverview>(
    `/projects/${encodeURIComponent(projectId)}/usage-overview`,
    { signal },
  );
  return data;
}

export async function listModels(signal?: AbortSignal) {
  const { data } = await apiClient.get<CatalogModel[]>("/models", { signal });
  return data;
}

export async function listRecommendedModels(signal?: AbortSignal) {
  const { data } = await apiClient.get<RecommendedModel[]>("/models/recommended", { signal });
  return data;
}

export async function listWebinars(signal?: AbortSignal) {
  const { data } = await apiClient.get<Webinar[]>("/marketing/webinars", { signal });
  return data;
}

export async function listPartners(signal?: AbortSignal) {
  const { data } = await apiClient.get<CloudPartner[]>("/marketing/partners", { signal });
  return data;
}
