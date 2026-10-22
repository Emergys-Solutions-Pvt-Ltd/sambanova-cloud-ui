"use client";

import { usePathname } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { useInviteMemberDialogStore } from "@/stores/invite-member-dialog-store";

import { useSettingsProject } from "../hooks/use-settings-project";
import { InviteMemberDialog } from "./members/invite-member-dialog";

/** Routes whose header shows "Invite Member" (Figma: All Members and Invitations, not Roles). */
const INVITE_ROUTES: readonly string[] = [routes.settingsMembers, routes.settingsInvitations];

/** "Project Settings" title bar; owners and admins get "Invite Member" on the Members views. */
export function SettingsHeader() {
  const pathname = usePathname();
  const { canManage } = useSettingsProject();
  const openInvite = useInviteMemberDialogStore((state) => state.openDialog);
  const showInvite = canManage && INVITE_ROUTES.includes(pathname);

  return (
    <>
      <PageHeader
        title="Project Settings"
        subtitle="Manage your project details and settings."
        actions={showInvite ? <Button onClick={openInvite}>Invite Member</Button> : undefined}
      />
      <InviteMemberDialog />
    </>
  );
}
