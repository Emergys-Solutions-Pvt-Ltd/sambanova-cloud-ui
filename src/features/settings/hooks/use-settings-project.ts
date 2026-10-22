"use client";

import { useActiveProject, useProjectDetails } from "@/features/projects";

/**
 * The project Project Settings act on (the active one) with its details and what the signed-in
 * user may do there: Owners and Admins manage it; only the Owner deletes it.
 */
export function useSettingsProject() {
  const active = useActiveProject();
  const details = useProjectDetails(active.project?.id);
  const role = details.data?.myRole;

  return {
    projectId: active.project?.id,
    details,
    /** True until both the project list and the project's details have loaded (or failed). */
    loading: active.isPending || (Boolean(active.project) && details.isPending),
    canManage: role === "owner" || role === "admin",
    isOwner: role === "owner",
  };
}
