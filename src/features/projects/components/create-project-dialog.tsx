"use client";

import { useMemo } from "react";

import { NameDialog } from "@/components/ui/name-dialog";
import { useCreateProjectDialogStore } from "@/stores/create-project-dialog-store";
import { toast } from "@/stores/toast-store";

import { useCreateProject } from "../hooks/use-create-project";
import { useProjects } from "../hooks/use-projects";
import { projectNameSchema } from "../schemas";

/** "Create New Project" modal (Figma: Create New Project). Mounted once in the app shell. */
export function CreateProjectDialog() {
  const open = useCreateProjectDialogStore((state) => state.open);
  const close = useCreateProjectDialogStore((state) => state.close);
  const projects = useProjects();
  const createProject = useCreateProject();
  const schema = useMemo(
    () => projectNameSchema((projects.data ?? []).map((project) => project.name)),
    [projects.data],
  );

  return (
    <NameDialog
      open={open}
      onOpenChange={(next) => !next && close()}
      title="Create New Project"
      description="Projects are shared workspaces where your team can collaborate, manage API resources, set custom rate limits, and control access from one place."
      label="Project Name"
      placeholder="Enter"
      submitLabel="Create Project"
      schema={schema}
      onSubmit={async (name) => {
        const project = await createProject.mutateAsync({ name });
        close();
        toast.success(`${project.name} Project Created Successfully`, 2500);
      }}
    />
  );
}
