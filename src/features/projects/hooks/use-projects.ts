"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { queryKeys } from "@/lib/query-keys";
import { selectActiveProjectId, useProjectStore } from "@/stores/project-store";
import { selectIsAuthenticated, useSessionStore } from "@/stores/session-store";

import { listProjects } from "../api/projects.api";

/** The signed-in user's projects. Guests have none, so nothing is fetched for them. */
export function useProjects() {
  const authenticated = useSessionStore(selectIsAuthenticated);
  return useQuery({
    queryKey: queryKeys.projects.list(),
    queryFn: ({ signal }) => listProjects(signal),
    enabled: authenticated,
  });
}

/**
 * The active project: the stored selection if it still exists, otherwise the
 * default project (or the first one).
 */
export function useActiveProject() {
  const activeProjectId = useProjectStore(selectActiveProjectId);
  const query = useProjects();
  const projects = query.data ?? [];

  const project =
    projects.find((item) => item.id === activeProjectId) ??
    projects.find((item) => item.isDefault) ??
    projects[0] ??
    null;

  return { ...query, project };
}

/** Switches project and drops cached data that belonged to the previous one. */
export function useSwitchProject() {
  const queryClient = useQueryClient();
  const setActiveProject = useProjectStore((state) => state.setActiveProject);

  return useCallback(
    (projectId: string) => {
      const previousId = useProjectStore.getState().activeProjectId;
      setActiveProject(projectId);
      if (previousId && previousId !== projectId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.project(previousId) });
      }
    },
    [queryClient, setActiveProject],
  );
}
