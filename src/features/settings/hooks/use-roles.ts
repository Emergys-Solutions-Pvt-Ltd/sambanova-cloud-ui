"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { type ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { type PermissionSet, type ProjectRole, type ProjectRoleDefinition } from "@/types/domain";

import { listRoles, updateRole } from "../api/settings.api";

/** The project's four roles with their permissions (Roles tab, member permission defaults). */
export function useRoles(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.settings.roles(projectId ?? ""),
    queryFn: ({ signal }) => listRoles(projectId!, signal),
    enabled: Boolean(projectId),
  });
}

interface UpdateRoleVariables {
  projectId: string;
  roleId: ProjectRole;
  permissions: PermissionSet;
}

/** Saves a role's permissions; members following the role change with it. */
export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation<ProjectRoleDefinition, ApiError, UpdateRoleVariables>({
    mutationFn: ({ projectId, roleId, permissions }) =>
      updateRole(projectId, roleId, { permissions }),
    onSuccess: (role, { projectId }) => {
      queryClient.setQueryData<ProjectRoleDefinition[]>(
        queryKeys.settings.roles(projectId),
        (current) => current?.map((item) => (item.id === role.id ? role : item)),
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.members(projectId) });
    },
  });
}
