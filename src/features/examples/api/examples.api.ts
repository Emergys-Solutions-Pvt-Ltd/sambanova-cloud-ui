import { apiClient, type PaginatedResponse, type PaginationParams } from "@/lib/api";
import { type CreateExampleItemInput, type ExampleItem } from "@/types/domain";

const path = (projectId: string) => `/projects/${encodeURIComponent(projectId)}/examples`;

export async function listExamples(
  projectId: string,
  params: Required<PaginationParams>,
  signal?: AbortSignal,
) {
  const { data } = await apiClient.get<PaginatedResponse<ExampleItem>>(path(projectId), {
    params,
    signal,
  });
  return data;
}

export async function createExample(projectId: string, input: CreateExampleItemInput) {
  const { data } = await apiClient.post<ExampleItem>(path(projectId), input);
  return data;
}
