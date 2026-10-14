"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { routes } from "@/config/routes";
import { useDeleteProject } from "@/features/projects";
import { isApiError } from "@/lib/api";
import { toast } from "@/stores/toast-store";
import { type ProjectDetails } from "@/types/domain";

/**
 * "Danger Zone" card (Figma `1387:65932`) with the "Delete Project" confirmation from Manage
 * Projects (`1398:115981`); none is drawn for Settings. After deleting, the default project
 * becomes active and the Dashboard opens.
 */
export function DangerZone({ project }: { project: ProjectDetails }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const { mutate: remove, isPending } = useDeleteProject();

  const confirm = () =>
    remove(project.id, {
      onSuccess: () => {
        setConfirming(false);
        toast.success(`${project.name} Project Deleted Successfully`, 2500);
        router.push(routes.dashboard);
      },
      onError: (error) =>
        toast.danger(isApiError(error) ? error.message : "Couldn’t delete this project."),
    });

  return (
    <section
      aria-labelledby="danger-zone-title"
      className="flex flex-col gap-4 rounded-lg border border-danger-zone p-6 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-col gap-1.5">
        <h2 id="danger-zone-title" className="text-heading-xs leading-[1.2] text-content">
          Danger Zone
        </h2>
        <p className="text-body-sm leading-[1.2] text-muted">
          Permanently remove your team and all of its data from the SambaNova cloud platform.
        </p>
        {project.isDefault && (
          <p className="text-body-sm leading-[1.2] text-muted">
            The default project can’t be deleted.
          </p>
        )}
      </div>
      <Button
        variant="danger-soft"
        leftIcon="trash"
        iconSize={20}
        disabled={project.isDefault}
        onClick={() => setConfirming(true)}
        className="self-start sm:self-auto"
      >
        Delete Project
      </Button>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        tone="danger"
        icon="warning"
        title="Delete Project"
        description="This project and all associated resources, including API keys, usage history, and project settings, will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete Project"
        pending={isPending}
        onConfirm={confirm}
      />
    </section>
  );
}
