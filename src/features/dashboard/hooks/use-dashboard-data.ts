"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";

import {
  getUsageOverview,
  listModels,
  listPartners,
  listRecommendedModels,
  listWebinars,
} from "../api/dashboard.api";

/** Usage numbers for one project. Disabled until a project is known. */
export function useUsageOverview(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.usageOverview(projectId ?? ""),
    queryFn: ({ signal }) => getUsageOverview(projectId!, signal),
    enabled: Boolean(projectId),
  });
}

/** Full model list: Quickstart selector and the Compare Models dialog. Rarely changes. */
export function useModelCatalog() {
  return useQuery({
    queryKey: queryKeys.models.catalog(),
    queryFn: ({ signal }) => listModels(signal),
    staleTime: 10 * 60_000,
  });
}

export function useRecommendedModels() {
  return useQuery({
    queryKey: queryKeys.models.recommended(),
    queryFn: ({ signal }) => listRecommendedModels(signal),
    staleTime: 10 * 60_000,
  });
}

export function useWebinars() {
  return useQuery({
    queryKey: queryKeys.marketing.webinars(),
    queryFn: ({ signal }) => listWebinars(signal),
    staleTime: 10 * 60_000,
  });
}

export function usePartners() {
  return useQuery({
    queryKey: queryKeys.marketing.partners(),
    queryFn: ({ signal }) => listPartners(signal),
    staleTime: 10 * 60_000,
  });
}
