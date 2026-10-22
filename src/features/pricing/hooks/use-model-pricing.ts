"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { type PaginationParams } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

import { listModelPricing } from "../api/pricing.api";

/** The Pricing table's page. Prices change rarely, and the previous page stays up while the next loads. */
export function useModelPricing(params: Required<PaginationParams>) {
  return useQuery({
    queryKey: queryKeys.models.pricing(params),
    queryFn: ({ signal }) => listModelPricing(params, signal),
    staleTime: 10 * 60_000,
    placeholderData: keepPreviousData,
  });
}
