"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { type ApiError, type PaginatedResponse } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import {
  type ProjectMember,
  type SettingsListParams,
  type UpdateMemberInput,
} from "@/types/domain";

import { listMembers, removeMember, updateMember } from "../api/settings.api";

type MemberPage = PaginatedResponse<ProjectMember>;

interface MemberTarget {
  projectId: string;
  memberId: string;
}

interface UpdateMemberVariables extends MemberTarget {
  input: UpdateMemberInput;
}

/** Every cached page of the project's member table, kept to roll an optimistic change back. */
type MemberSnapshot = [readonly unknown[], MemberPage | undefined][];

/** One page of the Members table; the previous page stays on screen while the next loads. */
export function useMembers(projectId: string | undefined, params: SettingsListParams) {
  return useQuery({
    queryKey: queryKeys.settings.memberList(projectId ?? "", params),
    queryFn: ({ signal }) => listMembers(projectId!, params, signal),
    enabled: Boolean(projectId),
    placeholderData: keepPreviousData,
  });
}

/** Applies `update` to every cached member page of the project and returns the previous pages. */
async function patchMemberPages(
  queryClient: ReturnType<typeof useQueryClient>,
  projectId: string,
  update: (page: MemberPage) => MemberPage,
): Promise<MemberSnapshot> {
  const key = queryKeys.settings.members(projectId);
  await queryClient.cancelQueries({ queryKey: key });
  const snapshot = queryClient.getQueriesData<MemberPage>({ queryKey: key });
  queryClient.setQueriesData<MemberPage>({ queryKey: key }, (page) => (page ? update(page) : page));
  return snapshot;
}

function restore(queryClient: ReturnType<typeof useQueryClient>, snapshot?: MemberSnapshot) {
  snapshot?.forEach(([key, page]) => queryClient.setQueryData(key, page));
}

/** Changes a member's role or permissions; a role change shows in the table at once. */
export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation<ProjectMember, ApiError, UpdateMemberVariables, MemberSnapshot>({
    mutationFn: ({ projectId, memberId, input }) => updateMember(projectId, memberId, input),
    onMutate: ({ projectId, memberId, input }) =>
      input.role
        ? patchMemberPages(queryClient, projectId, (page) => ({
            ...page,
            data: page.data.map((item) =>
              item.id === memberId ? { ...item, role: input.role! } : item,
            ),
          }))
        : Promise.resolve([]),
    onError: (_error, _variables, snapshot) => restore(queryClient, snapshot),
    onSettled: (_data, _error, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.members(projectId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.roles(projectId) });
    },
  });
}

/** Removes a member; the row disappears at once and comes back if the request fails. */
export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, MemberTarget, MemberSnapshot>({
    mutationFn: ({ projectId, memberId }) => removeMember(projectId, memberId),
    onMutate: ({ projectId, memberId }) =>
      patchMemberPages(queryClient, projectId, (page) => {
        const data = page.data.filter((item) => item.id !== memberId);
        return { ...page, data, total: page.total - (page.data.length - data.length) };
      }),
    onError: (_error, _variables, snapshot) => restore(queryClient, snapshot),
    onSettled: (_data, _error, { projectId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.members(projectId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.roles(projectId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
    },
  });
}
