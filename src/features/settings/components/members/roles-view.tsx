"use client";

import { Fragment, useState } from "react";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Icon } from "@/components/ui/icon/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { isApiError } from "@/lib/api";
import { toast } from "@/stores/toast-store";
import { type PermissionSet, type ProjectRoleDefinition } from "@/types/domain";

import { useRoles, useUpdateRole } from "../../hooks/use-roles";
import { useSettingsProject } from "../../hooks/use-settings-project";
import { capabilitiesOf, ROLE_ICONS } from "../../lib/permissions";
import { EditPermissionsDialog } from "../edit-permissions-dialog";
import { MembersToolbar } from "./members-toolbar";

/** Capabilities listed before "+N more" (Figma shows five). */
const VISIBLE_CAPABILITIES = 5;

const roleButtonId = (roleId: string) => `role-permissions-${roleId}`;

function RoleCard({
  role,
  onEdit,
}: {
  role: ProjectRoleDefinition;
  onEdit: (role: ProjectRoleDefinition) => void;
}) {
  const capabilities = capabilitiesOf(role.permissions);
  const shown = capabilities.slice(0, VISIBLE_CAPABILITIES);
  const more = capabilities.length - shown.length;

  return (
    <li className="flex flex-col gap-5 rounded-lg border border-default p-5 lg:flex-row lg:items-center lg:gap-6">
      <div className="flex items-center gap-4 lg:w-104 lg:shrink-0">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-role-icon text-accent">
          <Icon name={ROLE_ICONS[role.id]} size={28} />
        </span>
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-heading-sm leading-[1.2] font-bold text-primary">{role.name}</h2>
            <span className="flex h-5.5 items-center rounded-[20px] bg-badge-accent px-2 text-tiny leading-[1.2] font-semibold text-accent">
              {role.badge}
            </span>
          </div>
          <p className="text-body-sm leading-normal text-muted">{role.description}</p>
        </div>
      </div>

      <span aria-hidden="true" className="hidden h-15 w-px shrink-0 bg-role-divider lg:block" />

      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <h3 className="text-micro leading-[1.2] text-subtle uppercase">Key capabilities</h3>
        {capabilities.length > 0 ? (
          <ul className="flex flex-wrap items-center gap-x-2 gap-y-2">
            {shown.map((capability, index) => (
              <Fragment key={capability}>
                {index > 0 && (
                  <li
                    aria-hidden="true"
                    className="size-[4.65px] shrink-0 rounded-full bg-brand-secondary"
                  />
                )}
                <li className="text-micro leading-[1.2] font-medium text-capability">
                  {capability}
                </li>
              </Fragment>
            ))}
            {more > 0 && (
              <>
                <li
                  aria-hidden="true"
                  className="size-[4.65px] shrink-0 rounded-full bg-brand-secondary"
                />
                <li className="text-micro leading-[1.2] font-medium text-capability">
                  +{more} more
                </li>
              </>
            )}
          </ul>
        ) : (
          <p className="text-micro leading-[1.2] font-medium text-muted">No access</p>
        )}
      </div>

      <Button
        id={roleButtonId(role.id)}
        variant="bordered"
        className="self-start lg:self-auto"
        onClick={() => onEdit(role)}
        aria-label={`Edit permissions of the ${role.name} role`}
      >
        Edit Permissions
      </Button>
    </li>
  );
}

function RolesSkeleton() {
  return (
    <ul aria-busy="true" aria-label="Loading roles" className="flex flex-col gap-6">
      {Array.from({ length: 4 }, (_, index) => (
        <li key={index} className="flex items-center gap-4 rounded-lg border border-default p-5">
          <Skeleton className="size-14" radius="md" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-72" />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Project Settings › Members › Roles (Figma `1387:66321`, Edit Permissions `1387:67755`). */
export function RolesView() {
  const { projectId, canManage, loading } = useSettingsProject();
  const roles = useRoles(projectId);
  const updateRole = useUpdateRole();
  const [editing, setEditing] = useState<ProjectRoleDefinition | null>(null);
  const [open, setOpen] = useState(false);

  const readOnlyReason = !editing
    ? undefined
    : !editing.editable
      ? "The Owner role always has full access, so its permissions can’t be changed."
      : !canManage
        ? "Only project owners and admins can change role permissions."
        : undefined;

  const save = (permissions: PermissionSet) => {
    if (!editing || !projectId) return;
    updateRole.mutate(
      { projectId, roleId: editing.id, permissions },
      {
        onSuccess: (role) => {
          setOpen(false);
          toast.success(`${role.name} Permissions Updated Successfully`, 2500);
        },
        onError: (error) =>
          toast.danger(isApiError(error) ? error.message : "Couldn’t save the permissions."),
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <MembersToolbar />

      {loading || roles.isPending ? (
        <RolesSkeleton />
      ) : roles.isError ? (
        <ErrorState message="We couldn’t load the roles." onRetry={() => void roles.refetch()} />
      ) : (
        <ul className="flex flex-col gap-6" aria-label="Roles">
          {roles.data.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              onEdit={(target) => {
                setEditing(target);
                setOpen(true);
              }}
            />
          ))}
        </ul>
      )}

      <EditPermissionsDialog
        open={open}
        onOpenChange={setOpen}
        subject="role"
        context={
          editing
            ? `${editing.name} · ${editing.memberCount} ${editing.memberCount === 1 ? "member" : "members"}`
            : undefined
        }
        permissions={editing?.permissions ?? null}
        readOnlyReason={readOnlyReason}
        saving={updateRole.isPending}
        onSave={save}
      />
    </div>
  );
}
