import { apiClient, type PaginatedResponse } from "@/lib/api";
import {
  type CreateInvitationInput,
  type ProjectInvitation,
  type ProjectLimits,
  type ProjectMember,
  type ProjectRole,
  type ProjectRoleDefinition,
  type SettingsListParams,
  type UpdateMemberInput,
  type UpdateRoleInput,
} from "@/types/domain";

const base = (projectId: string) => `/projects/${encodeURIComponent(projectId)}`;
const member = (projectId: string, id: string) =>
  `${base(projectId)}/members/${encodeURIComponent(id)}`;
const invitation = (projectId: string, id: string) =>
  `${base(projectId)}/invitations/${encodeURIComponent(id)}`;

/* ---- Members ---- */

export async function listMembers(
  projectId: string,
  params: SettingsListParams,
  signal?: AbortSignal,
) {
  const { data } = await apiClient.get<PaginatedResponse<ProjectMember>>(
    `${base(projectId)}/members`,
    { params, signal },
  );
  return data;
}

/** Changes a member's role (resetting custom permissions) or their permissions. */
export async function updateMember(projectId: string, id: string, input: UpdateMemberInput) {
  const { data } = await apiClient.patch<ProjectMember>(member(projectId, id), input, {
    skipRetry: true,
  });
  return data;
}

export async function removeMember(projectId: string, id: string): Promise<void> {
  await apiClient.delete(member(projectId, id), { skipRetry: true });
}

/* ---- Invitations ---- */

export async function listInvitations(
  projectId: string,
  params: SettingsListParams,
  signal?: AbortSignal,
) {
  const { data } = await apiClient.get<PaginatedResponse<ProjectInvitation>>(
    `${base(projectId)}/invitations`,
    { params, signal },
  );
  return data;
}

export async function createInvitation(projectId: string, input: CreateInvitationInput) {
  const { data } = await apiClient.post<ProjectInvitation>(
    `${base(projectId)}/invitations`,
    input,
    {
      skipRetry: true,
    },
  );
  return data;
}

/** Sends the invitation again with a fresh expiry. */
export async function resendInvitation(projectId: string, id: string) {
  const { data } = await apiClient.post<ProjectInvitation>(
    `${invitation(projectId, id)}/resend`,
    undefined,
    { skipRetry: true },
  );
  return data;
}

export async function cancelInvitation(projectId: string, id: string): Promise<void> {
  await apiClient.delete(invitation(projectId, id), { skipRetry: true });
}

/* ---- Roles ---- */

export async function listRoles(projectId: string, signal?: AbortSignal) {
  const { data } = await apiClient.get<ProjectRoleDefinition[]>(`${base(projectId)}/roles`, {
    signal,
  });
  return data;
}

export async function updateRole(projectId: string, roleId: ProjectRole, input: UpdateRoleInput) {
  const { data } = await apiClient.patch<ProjectRoleDefinition>(
    `${base(projectId)}/roles/${encodeURIComponent(roleId)}`,
    input,
    { skipRetry: true },
  );
  return data;
}

/* ---- Limits ---- */

export async function getLimits(projectId: string, signal?: AbortSignal) {
  const { data } = await apiClient.get<ProjectLimits>(`${base(projectId)}/limits`, { signal });
  return data;
}
