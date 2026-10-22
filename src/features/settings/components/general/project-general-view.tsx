"use client";

import { type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { ErrorState } from "@/components/ui/error-state";
import { Icon, type IconName } from "@/components/ui/icon/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import {
  PROJECT_NAME_MAX,
  PROJECT_NAME_MIN,
  useProjects,
  useUpdateProject,
} from "@/features/projects";
import { formatDateAtTime } from "@/lib/format";
import { toast } from "@/stores/toast-store";
import { type ProjectDetails } from "@/types/domain";

import { useSettingsProject } from "../../hooks/use-settings-project";
import { DangerZone } from "./danger-zone";
import { InlineEditField } from "./inline-edit-field";

/** Longest description the API accepts (assumption; Figma sets no limit). */
export const DESCRIPTION_MAX = 200;

/** Figma: 184px label column with an 18px icon, 50px gap, then the value. */
function DetailRow({
  icon,
  label,
  children,
}: {
  icon: IconName;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:gap-12.5">
      <dt className="flex w-46 shrink-0 items-center gap-3 py-1.25 text-body leading-[1.2] text-muted uppercase">
        <Icon name={icon} size={18} />
        {label}
      </dt>
      <dd className="flex min-h-7 min-w-0 flex-1 items-start justify-between gap-4">{children}</dd>
    </div>
  );
}

const valueText = "py-1.25 text-body leading-[1.2] font-medium text-secondary";

function ProjectDetailsCard({ project, canEdit }: { project: ProjectDetails; canEdit: boolean }) {
  const projects = useProjects();
  const { mutateAsync: update } = useUpdateProject();

  const validateName = (name: string) => {
    if (name.length < PROJECT_NAME_MIN) {
      return `Project name must be at least ${PROJECT_NAME_MIN} characters.`;
    }
    if (name.length > PROJECT_NAME_MAX) {
      return `Project name must be ${PROJECT_NAME_MAX} characters or fewer.`;
    }
    const taken = (projects.data ?? []).some(
      (item) => item.id !== project.id && item.name.trim().toLowerCase() === name.toLowerCase(),
    );
    return taken ? "A project with this name already exists." : null;
  };

  return (
    <section aria-label="Project details" className="rounded-lg border border-default p-5">
      <dl className="flex flex-col divide-y divide-default">
        <DetailRow icon="folder" label="Project Name">
          <InlineEditField
            label="Project name"
            value={project.name}
            canEdit={canEdit}
            maxLength={PROJECT_NAME_MAX}
            validate={validateName}
            inputClassName="w-full sm:w-78.5"
            onSave={async (name) => {
              await update({ projectId: project.id, input: { name } });
              toast.success("Project Name Updated Successfully", 2500);
            }}
          />
        </DetailRow>

        <DetailRow icon="file-text" label="Description">
          <InlineEditField
            label="Description"
            value={project.description}
            emptyText="No description"
            canEdit={canEdit}
            maxLength={DESCRIPTION_MAX}
            validate={(description) =>
              description.length > DESCRIPTION_MAX
                ? `Description must be ${DESCRIPTION_MAX} characters or fewer.`
                : null
            }
            inputClassName="w-full max-w-150"
            onSave={async (description) => {
              await update({ projectId: project.id, input: { description } });
              toast.success("Description Updated Successfully", 2500);
            }}
          />
        </DetailRow>

        <DetailRow icon="user" label="Creator">
          {/* Name + email (31px) overhang the 28px row by 1.5px each way, as in Figma. */}
          <div className="-my-0.5 flex min-w-0 flex-col gap-0.5">
            <p className="text-body leading-[1.2] font-semibold break-words text-secondary">
              {project.createdBy.name}
            </p>
            <p className="text-tiny leading-[1.2] break-all text-muted">
              {project.createdBy.email}
            </p>
          </div>
        </DetailRow>

        <DetailRow icon="users-group" label="Team Members">
          <p className={valueText}>{project.memberCount}</p>
          <Button href={routes.settingsMembers} variant="bordered" className="-my-1.25">
            View Members
            <Icon name="chevron-right" size={20} strokeWidth={1.25} />
          </Button>
        </DetailRow>

        <DetailRow icon="calendar" label="Created On">
          <p className={valueText}>{formatDateAtTime(project.createdAt)}</p>
        </DetailRow>

        <DetailRow icon="clock-alt" label="Last Updated">
          <p className={valueText}>{formatDateAtTime(project.updatedAt)}</p>
        </DetailRow>

        <DetailRow icon="settings" label="Project ID">
          <p className={`${valueText} break-all`}>{project.id}</p>
          <CopyButton
            value={project.id}
            label="Copy project ID"
            icon="layers-subtract"
            size="field-lg"
            className="-my-1.25"
          />
        </DetailRow>
      </dl>
    </section>
  );
}

function GeneralSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading project details"
      className="rounded-lg border border-default p-5"
    >
      <div className="flex flex-col divide-y divide-default">
        {Array.from({ length: 7 }, (_, index) => (
          <div key={index} className="flex items-center gap-12.5 py-4 first:pt-0 last:pb-0">
            <Skeleton className="h-4.5 w-36" />
            <Skeleton className="h-4.5 w-64" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Project Settings › General (Figma `1387:65838`, edit state `1387:65951`). */
export function ProjectGeneralView() {
  const { details, loading, canManage, isOwner } = useSettingsProject();

  if (loading) return <GeneralSkeleton />;
  if (!details.data) {
    return (
      <ErrorState
        message="We couldn’t load this project’s details."
        onRetry={() => void details.refetch()}
      />
    );
  }

  return (
    // From lg up the Danger Zone sits at the bottom of the viewport, as in the 800px Figma frame.
    <div className="flex flex-col gap-6 lg:min-h-[calc(100dvh-11.5rem)] lg:justify-between">
      <ProjectDetailsCard project={details.data} canEdit={canManage} />
      {isOwner && <DangerZone project={details.data} />}
    </div>
  );
}
