"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";

import { getLimits } from "../api/settings.api";

/** Usage tier and per-model rate limits of the project. */
export function useLimits(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.settings.limits(projectId ?? ""),
    queryFn: ({ signal }) => getLimits(projectId!, signal),
    enabled: Boolean(projectId),
  });
}
