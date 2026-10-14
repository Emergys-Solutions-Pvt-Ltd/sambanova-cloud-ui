"use client";

import { useRef, useState } from "react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ErrorState } from "@/components/ui/error-state";
import { IconButton } from "@/components/ui/icon-button";
import { PaginationFooter } from "@/components/ui/pagination-footer";
import { SearchField } from "@/components/ui/search-field";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCard,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableMessageRow,
  TableSkeletonRows,
} from "@/components/ui/table";
import { isApiError } from "@/lib/api";
import { formatShortDateTime } from "@/lib/format";
import { toast } from "@/stores/toast-store";
import { type AssignableRole, type ProjectMember } from "@/types/domain";

import { useMembers, useRemoveMember, useUpdateMember } from "../../hooks/use-members";
import { useSettingsProject } from "../../hooks/use-settings-project";
import { useTableQuery } from "../../hooks/use-table-query";
import { ASSIGNABLE_ROLES, ROLE_LABELS } from "../../lib/permissions";
import { EditPermissionsDialog } from "../edit-permissions-dialog";
import { MembersToolbar } from "./members-toolbar";

type RowAction = "role" | "permissions" | "remove";

const COLUMNS = 5;
const ROLE_OPTIONS = [
  { options: ASSIGNABLE_ROLES.map((role) => ({ value: role, label: ROLE_LABELS[role] })) },
];

const article = (word: string) => (/^[aeiou]/i.test(word) ? "an" : "a");
const actionsId = (memberId: string) => `member-actions-${memberId}`;

/** Returns focus to a row's ⋮ once the control that had it (inline select, dialog) is gone. */
const focusRowActions = (memberId: string) =>
  requestAnimationFrame(() => document.getElementById(actionsId(memberId))?.focus());

interface MemberRowProps {
  member: ProjectMember;
  canManage: boolean;
  editingRole: boolean;
  onAction: (member: ProjectMember, action: RowAction) => void;
  onRoleChosen: (member: ProjectMember, role: AssignableRole | null) => void;
}

function MemberRow({ member, canManage, editingRole, onAction, onRoleChosen }: MemberRowProps) {
  // Menu choice, acted on once the menu has closed so focus handling never fights Radix.
  const pending = useRef<RowAction | null>(null);
  const isOwner = member.role === "owner";

  return (
    <tr>
      <TableCell className="wrap-break-word">
        {member.name}
        {member.isYou && <span className="text-muted"> (You)</span>}
      </TableCell>
      <TableCell className="wrap-anywhere">{member.email}</TableCell>
      <TableCell className="font-semibold">
        {editingRole && !isOwner ? (
          <Select
            variant="inline"
            aria-label={`Role of ${member.name}`}
            defaultOpen
            value={member.role}
            groups={ROLE_OPTIONS}
            className="max-w-47.75"
            onValueChange={(role) => onRoleChosen(member, role as AssignableRole)}
            onOpenChange={(open) => {
              if (!open) onRoleChosen(member, null);
            }}
          />
        ) : (
          ROLE_LABELS[member.role]
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap">{formatShortDateTime(member.joinedAt)}</TableCell>
      <TableCell className="text-center">
        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton
                id={actionsId(member.id)}
                icon="dots-vertical"
                variant="contrast"
                size="row"
                disabled={isOwner}
                title={isOwner ? "The project owner can’t be changed or removed" : undefined}
                aria-label={`Actions for ${member.name}`}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              surface="flat"
              align="end"
              sideOffset={4}
              className="min-w-43"
              onCloseAutoFocus={(event) => {
                const action = pending.current;
                pending.current = null;
                if (!action) return;
                // The inline select takes focus itself; dialogs restore it to ⋮ on close.
                if (action === "role") event.preventDefault();
                onAction(member, action);
              }}
            >
              <DropdownMenuItem variant="flat" onSelect={() => (pending.current = "role")}>
                Change Role
              </DropdownMenuItem>
              <DropdownMenuItem variant="flat" onSelect={() => (pending.current = "permissions")}>
                Edit Permissions
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="flat"
                destructive
                onSelect={() => (pending.current = "remove")}
              >
                Remove Member
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TableCell>
    </tr>
  );
}

/** Project Settings › Members › All Members (Figma `1387:66063`, Edit Role `1387:66577`). */
export function MembersView() {
  const { projectId, canManage, loading } = useSettingsProject();
  const { search, setSearch, setPage, params } = useTableQuery();
  const members = useMembers(projectId, params);
  const updateMember = useUpdateMember();
  const removeMember = useRemoveMember();

  const [roleEditId, setRoleEditId] = useState<string | null>(null);
  // Targets stay set while their dialog animates out; `open` flags drive visibility.
  const [permissionsFor, setPermissionsFor] = useState<ProjectMember | null>(null);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [removeFor, setRemoveFor] = useState<ProjectMember | null>(null);
  const [removeOpen, setRemoveOpen] = useState(false);

  const onAction = (member: ProjectMember, action: RowAction) => {
    if (action === "role") setRoleEditId(member.id);
    if (action === "permissions") {
      setPermissionsFor(member);
      setPermissionsOpen(true);
    }
    if (action === "remove") {
      setRemoveFor(member);
      setRemoveOpen(true);
    }
  };

  const onRoleChosen = (member: ProjectMember, role: AssignableRole | null) => {
    setRoleEditId(null);
    focusRowActions(member.id);
    if (!role || role === member.role || !projectId) return;
    const label = ROLE_LABELS[role];
    updateMember.mutate(
      { projectId, memberId: member.id, input: { role } },
      {
        onSuccess: () => toast.success(`${member.name} is now ${article(label)} ${label}`, 2500),
        onError: (error) =>
          toast.danger(isApiError(error) ? error.message : "Couldn’t change the role."),
      },
    );
  };

  const savePermissions = (permissions: ProjectMember["permissions"]) => {
    if (!permissionsFor || !projectId) return;
    updateMember.mutate(
      { projectId, memberId: permissionsFor.id, input: { permissions } },
      {
        onSuccess: () => {
          setPermissionsOpen(false);
          toast.success("Permissions Updated Successfully", 2500);
        },
        onError: (error) =>
          toast.danger(isApiError(error) ? error.message : "Couldn’t save the permissions."),
      },
    );
  };

  const confirmRemove = () => {
    if (!removeFor || !projectId) return;
    const { id, name } = removeFor;
    removeMember.mutate(
      { projectId, memberId: id },
      {
        onSuccess: () => {
          setRemoveOpen(false);
          toast.success(`${name} Removed Successfully`, 2500);
        },
        onError: (error) =>
          toast.danger(isApiError(error) ? error.message : "Couldn’t remove this member."),
      },
    );
  };

  const data = members.data;
  const firstLoad = loading || (members.isPending && Boolean(projectId));

  return (
    <div className="flex flex-col gap-6">
      <MembersToolbar
        search={
          <SearchField
            aria-label="Search members"
            placeholder="Search members"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onClear={() => setSearch("")}
            className="w-full sm:w-70.25"
          />
        }
      />

      {members.isError && !data ? (
        <ErrorState
          message="We couldn’t load the members."
          onRetry={() => void members.refetch()}
        />
      ) : (
        <TableCard
          className="bg-surface"
          footer={<PaginationFooter result={data} onPageChange={setPage} label="Members pages" />}
        >
          <Table caption="Project members" className="min-w-240 table-fixed" aria-busy={firstLoad}>
            <colgroup>
              <col className="w-[17%]" />
              <col className="w-[24.5%]" />
              <col className="w-[19.5%]" />
              <col className="w-[19.5%]" />
              <col className="w-[19.5%]" />
            </colgroup>
            <TableHead>
              <tr>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Role</TableHeaderCell>
                <TableHeaderCell>Joined On</TableHeaderCell>
                <TableHeaderCell className="text-center">Action</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {firstLoad ? (
                <TableSkeletonRows columns={COLUMNS} rows={7} />
              ) : data && data.data.length > 0 ? (
                data.data.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    canManage={canManage}
                    editingRole={roleEditId === member.id}
                    onAction={onAction}
                    onRoleChosen={onRoleChosen}
                  />
                ))
              ) : (
                <TableMessageRow colSpan={COLUMNS}>
                  {params.search ? `No members match “${params.search}”.` : "No members yet."}
                </TableMessageRow>
              )}
            </TableBody>
          </Table>
        </TableCard>
      )}

      <EditPermissionsDialog
        open={permissionsOpen}
        onOpenChange={setPermissionsOpen}
        subject="member"
        context={
          permissionsFor
            ? `${permissionsFor.name} · ${ROLE_LABELS[permissionsFor.role]}${
                permissionsFor.customPermissions ? " (custom permissions)" : ""
              }`
            : undefined
        }
        permissions={permissionsFor?.permissions ?? null}
        saving={updateMember.isPending}
        onSave={savePermissions}
        onCloseAutoFocus={(event) => {
          if (!permissionsFor) return;
          event.preventDefault();
          focusRowActions(permissionsFor.id);
        }}
      />

      <ConfirmDialog
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        tone="danger"
        icon="warning"
        title="Remove Member"
        description={`${removeFor?.name ?? "This member"} will no longer have access to this project. Any API keys, resources, or assets they created will remain available to the project unless transferred or deleted separately.`}
        confirmLabel="Remove Member"
        pending={removeMember.isPending}
        onConfirm={confirmRemove}
      />
    </div>
  );
}
