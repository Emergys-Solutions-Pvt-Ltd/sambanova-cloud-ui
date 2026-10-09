"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { type ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { type CreateExampleItemInput, type ExampleItem } from "@/types/domain";

import { createExample, listExamples } from "../api/examples.api";

/** Pattern: paginated list query. Keeps the previous page on screen while the next one loads. */
export function useExamples(projectId: string | undefined, page: number, pageSize = 10) {
  return useQuery({
    queryKey: queryKeys.examples.list(projectId ?? "", { page, pageSize }),
    queryFn: ({ signal }) => listExamples(projectId!, { page, pageSize }, signal),
    enabled: Boolean(projectId),
    placeholderData: keepPreviousData,
  });
}

/** Pattern: mutation that invalidates every list for the same project on success. */
export function useCreateExample(projectId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation<ExampleItem, ApiError, CreateExampleItemInput>({
    mutationFn: (input) => createExample(projectId!, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.examples.all(projectId ?? "") }),
  });
}
