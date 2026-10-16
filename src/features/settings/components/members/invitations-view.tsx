"use client";

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
import { cn } from "@/lib/cn";
import { formatShortDate } from "@/lib/format";
import { toast } from "@/stores/toast-store";
import { type InvitationStatus, type ProjectInvitation } from "@/types/domain";

import {
  useCancelInvitation,
  useInvitations,
  useResendInvitation,
} from "../../hooks/use-invitations";
import { useSettingsProject } from "../../hooks/use-settings-project";
import { useTableQuery } from "../../hooks/use-table-query";
import { ROLE_LABELS } from "../../lib/permissions";
import { MembersToolbar } from "./members-toolbar";

const COLUMNS = 6;

const STATUS: Record<InvitationStatus, { label: string; classes: string }> = {
  pending: { label: "Pending", classes: "border-warning bg-warning-bg text-warning" },
  expired: { label: "Expired", classes: "border-error bg-error-bg text-error" },
};

/** Invitation status chip (Figma "Badge": r6, 0.5px stroke in the text colour). */
function StatusChip({ status }: { status: InvitationStatus }) {
  const { label, classes } = STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border-[0.5px] px-2.5 py-0.5 text-caption font-medium",
        classes,
      )}
    >
      {label}
    </span>
  );
}

function InvitationRow({
  invitation,
  canManage,
  onResend,
  onCancel,
}: {
  invitation: ProjectInvitation;
  canManage: boolean;
  onResend: (invitation: ProjectInvitation) => void;
  onCancel: (invitation: ProjectInvitation) => void;
}) {
  return (
    <tr>
      <TableCell className="wrap-anywhere">{invitation.email}</TableCell>
      <TableCell className="font-semibold">{ROLE_LABELS[invitation.role]}</TableCell>
      <TableCell className="whitespace-nowrap">{formatShortDate(invitation.invitedAt)}</TableCell>
      <TableCell className="whitespace-nowrap">{formatShortDate(invitation.expiresAt)}</TableCell>
      <TableCell>
        <StatusChip status={invitation.status} />
      </TableCell>
      <TableCell className="text-center">
        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton
                icon="dots-vertical"
                variant="contrast"
                size="row"
                aria-label={`Actions for the invitation to ${invitation.email}`}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent surface="flat" align="end" sideOffset={4} className="min-w-43">
              <DropdownMenuItem variant="flat" onSelect={() => onResend(invitation)}>
                Resend Invitation
              </DropdownMenuItem>
              <DropdownMenuItem variant="flat" destructive onSelect={() => onCancel(invitation)}>
                Cancel Invitation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TableCell>
    </tr>
  );
}

/** Project Settings › Members › Invitations (Figma `1387:66196`, menu `1387:67221`). */
export function InvitationsView() {
  const { projectId, canManage, loading } = useSettingsProject();
  const { search, setSearch, setPage, params } = useTableQuery();
  const invitations = useInvitations(projectId, params);
  const resend = useResendInvitation();
  const cancel = useCancelInvitation();

  const onResend = (invitation: ProjectInvitation) => {
    if (!projectId) return;
    resend.mutate(
      { projectId, invitationId: invitation.id },
      {
        onSuccess: () => toast.success(`Invitation Resent to ${invitation.email}`, 2500),
        onError: (error) =>
          toast.danger(isApiError(error) ? error.message : "Couldn’t resend the invitation."),
      },
    );
  };

  const onCancel = (invitation: ProjectInvitation) => {
    if (!projectId) return;
    cancel.mutate(
      { projectId, invitationId: invitation.id },
      {
        onSuccess: () => toast.success("Invitation Cancelled Successfully", 2500),
        onError: (error) =>
          toast.danger(isApiError(error) ? error.message : "Couldn’t cancel the invitation."),
      },
    );
  };

  const data = invitations.data;
  const firstLoad = loading || (invitations.isPending && Boolean(projectId));

  return (
    <div className="flex flex-col gap-6">
      <MembersToolbar
        search={
          <SearchField
            aria-label="Search invited members"
            placeholder="Search invited members"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onClear={() => setSearch("")}
            className="w-full sm:w-70.25"
          />
        }
      />

      {invitations.isError && !data ? (
        <ErrorState
          message="We couldn’t load the invitations."
          onRetry={() => void invitations.refetch()}
        />
      ) : (
        <TableCard
          className="bg-surface"
          footer={
            <PaginationFooter result={data} onPageChange={setPage} label="Invitations pages" />
          }
        >
          <Table caption="Invitations" minWidth="lg" className="table-fixed" aria-busy={firstLoad}>
            <colgroup>
              <col className="w-[24.6%]" />
              <col className="w-[12.2%]" />
              <col className="w-[16.3%]" />
              <col className="w-[21.6%]" />
              <col className="w-[14.9%]" />
              <col className="w-[10.4%]" />
            </colgroup>
            <TableHead>
              <tr>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Role</TableHeaderCell>
                <TableHeaderCell>Invited On</TableHeaderCell>
                <TableHeaderCell>Expires On</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell className="text-center">Action</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {firstLoad ? (
                <TableSkeletonRows columns={COLUMNS} />
              ) : data && data.data.length > 0 ? (
                data.data.map((invitation) => (
                  <InvitationRow
                    key={invitation.id}
                    invitation={invitation}
                    canManage={canManage}
                    onResend={onResend}
                    onCancel={onCancel}
                  />
                ))
              ) : (
                <TableMessageRow colSpan={COLUMNS}>
                  {params.search
                    ? `No invitations match “${params.search}”.`
                    : canManage
                      ? "No invitations yet. Invite someone with Invite Member."
                      : "No invitations yet."}
                </TableMessageRow>
              )}
            </TableBody>
          </Table>
        </TableCard>
      )}
    </div>
  );
}
