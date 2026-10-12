"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { type Project } from "@/types/domain";

import { createProject } from "../api/projects.api";
import { useSwitchProject } from "./use-projects";

/** Creates a project, adds it to the cached list and makes it the active project. */
export function useCreateProject() {
  const queryClient = useQueryClient();
  const switchProject = useSwitchProject();

  return useMutation({
    mutationFn: createProject,
    onSuccess: (project) => {
      queryClient.setQueryData<Project[]>(queryKeys.projects.list(), (current) =>
        current ? [...current, project] : [project],
      );
      switchProject(project.id);
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.list() });
    },
  });
}
