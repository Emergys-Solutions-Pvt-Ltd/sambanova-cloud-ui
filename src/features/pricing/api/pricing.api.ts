import { apiClient, type PaginatedResponse, type PaginationParams } from "@/lib/api";
import { type ModelPriceRow } from "@/types/domain";

/** One page of the model price list (context window and USD per million tokens). */
export async function listModelPricing(params: Required<PaginationParams>, signal?: AbortSignal) {
  const { data } = await apiClient.get<PaginatedResponse<ModelPriceRow>>("/models/pricing", {
    params,
    signal,
  });
  return data;
}
