"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { type ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import {
  type CreateInvitationInput,
  type ProjectInvitation,
  type SettingsListParams,
} from "@/types/domain";

import {
  cancelInvitation,
  createInvitation,
  listInvitations,
  resendInvitation,
} from "../api/settings.api";

interface InvitationTarget {
  projectId: string;
  invitationId: string;
}

interface CreateInvitationVariables {
  projectId: string;
  input: CreateInvitationInput;
}

/** One page of the Invitations table, newest first. */
export function useInvitations(projectId: string | undefined, params: SettingsListParams) {
  return useQuery({
    queryKey: queryKeys.settings.invitationList(projectId ?? "", params),
    queryFn: ({ signal }) => listInvitations(projectId!, params, signal),
    enabled: Boolean(projectId),
    placeholderData: keepPreviousData,
  });
}

function useInvalidateInvitations() {
  const queryClient = useQueryClient();
  return (projectId: string) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.settings.invitations(projectId) });
}

/** Invites someone to a project (not necessarily the active one). */
export function useCreateInvitation() {
  const invalidate = useInvalidateInvitations();
  return useMutation<ProjectInvitation, ApiError, CreateInvitationVariables>({
    mutationFn: ({ projectId, input }) => createInvitation(projectId, input),
    onSuccess: (_invitation, { projectId }) => void invalidate(projectId),
  });
}

export function useResendInvitation() {
  const invalidate = useInvalidateInvitations();
  return useMutation<ProjectInvitation, ApiError, InvitationTarget>({
    mutationFn: ({ projectId, invitationId }) => resendInvitation(projectId, invitationId),
    onSettled: (_data, _error, { projectId }) => void invalidate(projectId),
  });
}

export function useCancelInvitation() {
  const invalidate = useInvalidateInvitations();
  return useMutation<void, ApiError, InvitationTarget>({
    mutationFn: ({ projectId, invitationId }) => cancelInvitation(projectId, invitationId),
    onSettled: (_data, _error, { projectId }) => void invalidate(projectId),
  });
}
