"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { TextField } from "@/components/ui/input";
import { isApiError } from "@/lib/api";
import { useCreateProjectDialogStore } from "@/stores/create-project-dialog-store";
import { toast } from "@/stores/toast-store";

import { useCreateProject } from "../hooks/use-create-project";
import { useProjects } from "../hooks/use-projects";
import { type CreateProjectValues, createProjectSchema } from "../schemas";

function CreateProjectForm({ onDone }: { onDone: () => void }) {
  const projects = useProjects();
  const createProject = useCreateProject();
  const schema = useMemo(
    () => createProjectSchema((projects.data ?? []).map((project) => project.name)),
    [projects.data],
  );

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<CreateProjectValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { name: "" },
  });

  const onSubmit = handleSubmit(({ name }) => {
    clearErrors("root");
    createProject.mutate(
      { name },
      {
        onSuccess: (project) => {
          onDone();
          toast.success(`${project.name} Project Created Successfully`, 2500);
        },
        onError: (error) => {
          const message = isApiError(error)
            ? error.message
            : "Could not create the project. Try again.";
          // 409 and 422 belong to the field; anything else is a form-level problem.
          if (isApiError(error) && (error.status === 409 || error.status === 422)) {
            setError("name", { message });
          } else {
            setError("root", { message });
          }
        },
      },
    );
  });

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-7.5">
      <TextField
        label="Project Name"
        labelClassName="font-normal"
        fieldSize="lg"
        bordered
        autoFocus
        autoComplete="off"
        placeholder="Enter"
        error={errors.name?.message}
        {...register("name")}
      />

      {errors.root?.message && (
        <p
          role="alert"
          className="-mt-3.5 rounded-md border border-error-border bg-error-bg px-3 py-2 text-body-sm text-error"
        >
          {errors.root.message}
        </p>
      )}

      <div className="flex justify-end gap-4">
        <DialogClose asChild>
          <Button type="button" variant="cancel">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" loading={createProject.isPending} disabled={!isValid}>
          Create Project
        </Button>
      </div>
    </form>
  );
}

/** "Create New Project" modal (Figma: Create New Project). Mounted once in the app shell. */
export function CreateProjectDialog() {
  const open = useCreateProjectDialogStore((state) => state.open);
  const close = useCreateProjectDialogStore((state) => state.close);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent
        size="md"
        title="Create New Project"
        description="Projects are shared workspaces where your team can collaborate, manage API resources, set custom rate limits, and control access from one place."
      >
        <CreateProjectForm onDone={close} />
      </DialogContent>
    </Dialog>
  );
}
