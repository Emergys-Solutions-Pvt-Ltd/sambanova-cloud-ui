import { http, HttpResponse } from "msw";

import {
  type AssignableRole,
  type CreateInvitationInput,
  type PermissionArea,
  type PermissionSet,
  type ProjectDetails,
  type ProjectLimits,
  type ProjectRole,
  type SettingsListParams,
  type UpdateMemberInput,
  type UpdateProjectInput,
  type UpdateRoleInput,
} from "@/types/domain";

import { findAccountBySession } from "../db/accounts";
import { totalPurchasedBy } from "../db/billing";
import {
  cancelInvitationFor,
  createInvitationFor,
  deleteTeamFor,
  listInvitationsFor,
  listMembersFor,
  listRolesFor,
  type MockActor,
  removeMemberFor,
  resendInvitationFor,
  teamSummaryFor,
  updateMemberFor,
  updateRoleFor,
} from "../db/members";
import {
  deleteProjectFor,
  getProjectRecordFor,
  type ProjectRecord,
  updateProjectFor,
} from "../db/projects";
import { readSessionToken } from "../db/session-cookie";
import { modelCatalogFixture } from "../fixtures/dashboard";
import {
  ALLOWED_LEVELS,
  PROJECT_ROLES,
  RATE_LIMITS,
  USAGE_TIERS,
} from "../fixtures/project-settings";

import { api, errorBody, notFound, validationError, withSession } from "./shared";

const NAME_MIN = 3;
const NAME_MAX = 50;
const DESCRIPTION_MAX = 200;
const MAX_PAGE_SIZE = 50;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ASSIGNABLE: readonly AssignableRole[] = ["admin", "developer", "viewer"];
const AREAS = Object.keys(ALLOWED_LEVELS) as PermissionArea[];

const forbidden = (message: string) =>
  HttpResponse.json(errorBody("FORBIDDEN", message), { status: 403 });

const conflict = (code: string, message: string, field?: string) =>
  HttpResponse.json(
    { error: { code, message, ...(field && { details: { field } }) } },
    { status: 409 },
  );

/** The signed-in account and the project it can see, or `null` (→ 404 Project). */
async function actorWithProject(projectId: string) {
  const account = await findAccountBySession(readSessionToken());
  if (!account) return null;
  const record = getProjectRecordFor(account.id, projectId);
  if (!record) return null;
  const actor: MockActor = { id: account.id, name: account.name, email: account.email };
  return { actor, record, summary: teamSummaryFor(actor, record.project) };
}

const canManage = (role: ProjectRole) => role === "owner" || role === "admin";

function toDetails(
  record: ProjectRecord,
  summary: ReturnType<typeof teamSummaryFor>,
): ProjectDetails {
  return {
    ...record.project,
    description: record.description,
    createdBy: summary.owner,
    memberCount: summary.memberCount,
    updatedAt: record.updatedAt,
    myRole: summary.myRole,
  };
}

function listParams(request: Request): SettingsListParams {
  const url = new URL(request.url);
  return {
    page: Math.max(1, Number(url.searchParams.get("page")) || 1),
    pageSize: Math.min(MAX_PAGE_SIZE, Math.max(1, Number(url.searchParams.get("pageSize")) || 10)),
    search: url.searchParams.get("search") ?? "",
  };
}

/** A complete permission set whose levels are all allowed for their area. */
function isPermissionSet(value: unknown): value is PermissionSet {
  if (!value || typeof value !== "object") return false;
  const set = value as Record<string, unknown>;
  return AREAS.every((area) => (ALLOWED_LEVELS[area] as readonly unknown[]).includes(set[area]));
}

const isAssignable = (role: unknown): role is AssignableRole =>
  ASSIGNABLE.includes(role as AssignableRole);

type ProjectParams = { projectId: string };
type MemberParams = ProjectParams & { memberId: string };
type InvitationParams = ProjectParams & { invitationId: string };
type RoleParams = ProjectParams & { roleId: string };

/** Mock Project Settings API: project details, members, invitations, roles and limits. */
export const projectSettingsHandlers = [
  http.get(
    api("/projects/:projectId"),
    withSession<ProjectParams>(async ({ params }) => {
      const found = await actorWithProject(params.projectId);
      return found
        ? HttpResponse.json(toDetails(found.record, found.summary))
        : notFound("Project");
    }),
  ),

  http.patch(
    api("/projects/:projectId"),
    withSession<ProjectParams>(async ({ params, request }) => {
      const found = await actorWithProject(params.projectId);
      if (!found) return notFound("Project");
      if (!canManage(found.summary.myRole)) {
        return forbidden("Only owners and admins can edit this project.");
      }

      const input = (await request.json()) as Partial<UpdateProjectInput>;
      const name = typeof input.name === "string" ? input.name.trim() : undefined;
      const description =
        typeof input.description === "string" ? input.description.trim() : undefined;

      if (name !== undefined && (name.length < NAME_MIN || name.length > NAME_MAX)) {
        return validationError(`Project name must be ${NAME_MIN} to ${NAME_MAX} characters.`, {
          field: "name",
        });
      }
      if (description !== undefined && description.length > DESCRIPTION_MAX) {
        return validationError(`Description must be ${DESCRIPTION_MAX} characters or fewer.`, {
          field: "description",
        });
      }

      const result = updateProjectFor(found.actor.id, params.projectId, { name, description });
      if (result.status === "not-found") return notFound("Project");
      if (result.status === "name-taken") {
        return conflict("PROJECT_NAME_TAKEN", "A project with this name already exists.", "name");
      }
      return HttpResponse.json(toDetails(result.record, found.summary));
    }),
  ),

  http.delete(
    api("/projects/:projectId"),
    withSession<ProjectParams>(async ({ params }) => {
      const found = await actorWithProject(params.projectId);
      if (!found) return notFound("Project");
      if (found.summary.myRole !== "owner") {
        return forbidden("Only the project owner can delete this project.");
      }

      const result = deleteProjectFor(found.actor.id, params.projectId);
      if (result === "not-found") return notFound("Project");
      if (result === "default") return forbidden("The default project can’t be deleted.");
      deleteTeamFor(found.actor.id, params.projectId);
      return new HttpResponse(null, { status: 204 });
    }),
  ),

  http.get(
    api("/projects/:projectId/members"),
    withSession<ProjectParams>(async ({ params, request }) => {
      const found = await actorWithProject(params.projectId);
      if (!found) return notFound("Project");
      return HttpResponse.json(
        listMembersFor(found.actor, found.record.project, listParams(request)),
      );
    }),
  ),

  http.patch(
    api("/projects/:projectId/members/:memberId"),
    withSession<MemberParams>(async ({ params, request }) => {
      const found = await actorWithProject(params.projectId);
      if (!found) return notFound("Project");
      if (!canManage(found.summary.myRole)) {
        return forbidden("Only owners and admins can change members.");
      }

      const input = (await request.json()) as Partial<UpdateMemberInput>;
      if (input.role === undefined && input.permissions === undefined) {
        return validationError("Send a role or permissions.", { field: "role" });
      }
      if (input.role !== undefined && !isAssignable(input.role)) {
        return validationError("Choose Admin, Developer or Viewer.", { field: "role" });
      }
      if (input.permissions !== undefined && !isPermissionSet(input.permissions)) {
        return validationError("Some permissions aren’t valid.", { field: "permissions" });
      }

      const result = updateMemberFor(found.actor, found.record.project, params.memberId, {
        role: input.role,
        permissions: input.permissions,
      });
      if (result.status === "not-found") return notFound("Member");
      if (result.status === "owner") return forbidden("The project owner can’t be changed.");
      return HttpResponse.json(result.member);
    }),
  ),

  http.delete(
    api("/projects/:projectId/members/:memberId"),
    withSession<MemberParams>(async ({ params }) => {
      const found = await actorWithProject(params.projectId);
      if (!found) return notFound("Project");
      if (!canManage(found.summary.myRole)) {
        return forbidden("Only owners and admins can remove members.");
      }

      const result = removeMemberFor(found.actor, found.record.project, params.memberId);
      if (result === "not-found") return notFound("Member");
      if (result === "owner") return forbidden("The project owner can’t be removed.");
      return new HttpResponse(null, { status: 204 });
    }),
  ),

  http.get(
    api("/projects/:projectId/invitations"),
    withSession<ProjectParams>(async ({ params, request }) => {
      const found = await actorWithProject(params.projectId);
      if (!found) return notFound("Project");
      return HttpResponse.json(
        listInvitationsFor(found.actor, found.record.project, listParams(request)),
      );
    }),
  ),

  http.post(
    api("/projects/:projectId/invitations"),
    withSession<ProjectParams>(async ({ params, request }) => {
      const found = await actorWithProject(params.projectId);
      if (!found) return notFound("Project");
      if (!canManage(found.summary.myRole)) {
        return forbidden("Only owners and admins can invite members.");
      }

      const input = (await request.json()) as Partial<CreateInvitationInput>;
      const email = input.email?.trim() ?? "";
      if (!EMAIL_PATTERN.test(email)) {
        return validationError("Enter a valid email address.", { field: "email" });
      }
      if (!isAssignable(input.role)) {
        return validationError("Choose a role.", { field: "role" });
      }

      const result = createInvitationFor(found.actor, found.record.project, {
        email,
        role: input.role,
      });
      if (result.status === "member") {
        return conflict(
          "ALREADY_MEMBER",
          "This person is already a member of the project.",
          "email",
        );
      }
      if (result.status === "pending") {
        return conflict(
          "INVITATION_PENDING",
          "An invitation to this email is already pending. Resend it from Invitations.",
          "email",
        );
      }
      return HttpResponse.json(result.invitation, { status: 201 });
    }),
  ),

  http.post(
    api("/projects/:projectId/invitations/:invitationId/resend"),
    withSession<InvitationParams>(async ({ params }) => {
      const found = await actorWithProject(params.projectId);
      if (!found) return notFound("Project");
      if (!canManage(found.summary.myRole)) {
        return forbidden("Only owners and admins can resend invitations.");
      }
      const invitation = resendInvitationFor(
        found.actor,
        found.record.project,
        params.invitationId,
      );
      return invitation ? HttpResponse.json(invitation) : notFound("Invitation");
    }),
  ),

  http.delete(
    api("/projects/:projectId/invitations/:invitationId"),
    withSession<InvitationParams>(async ({ params }) => {
      const found = await actorWithProject(params.projectId);
      if (!found) return notFound("Project");
      if (!canManage(found.summary.myRole)) {
        return forbidden("Only owners and admins can cancel invitations.");
      }
      return cancelInvitationFor(found.actor, found.record.project, params.invitationId)
        ? new HttpResponse(null, { status: 204 })
        : notFound("Invitation");
    }),
  ),

  http.get(
    api("/projects/:projectId/roles"),
    withSession<ProjectParams>(async ({ params }) => {
      const found = await actorWithProject(params.projectId);
      if (!found) return notFound("Project");
      return HttpResponse.json(listRolesFor(found.actor, found.record.project));
    }),
  ),

  http.patch(
    api("/projects/:projectId/roles/:roleId"),
    withSession<RoleParams>(async ({ params, request }) => {
      const found = await actorWithProject(params.projectId);
      if (!found) return notFound("Project");
      if (!canManage(found.summary.myRole)) {
        return forbidden("Only owners and admins can change roles.");
      }
      if (!PROJECT_ROLES.includes(params.roleId as ProjectRole)) return notFound("Role");

      const input = (await request.json()) as Partial<UpdateRoleInput>;
      if (!isPermissionSet(input.permissions)) {
        return validationError("Some permissions aren’t valid.", { field: "permissions" });
      }
      const role = updateRoleFor(
        found.actor,
        found.record.project,
        params.roleId as ProjectRole,
        input.permissions,
      );
      return role === "owner"
        ? forbidden("Owner permissions can’t be changed.")
        : HttpResponse.json(role);
    }),
  ),

  http.get(
    api("/projects/:projectId/limits"),
    withSession<ProjectParams>(async ({ params }) => {
      const found = await actorWithProject(params.projectId);
      if (!found) return notFound("Project");

      const spend = totalPurchasedBy(found.actor.id);
      const currentTier = USAGE_TIERS.reduce(
        (tier, item) => (spend >= item.threshold ? item.level : tier),
        0,
      );
      const body: ProjectLimits = {
        tiers: USAGE_TIERS,
        currentTier,
        spend,
        rateLimits: RATE_LIMITS.flatMap((limit) => {
          const model = modelCatalogFixture.find((item) => item.id === limit.modelId);
          return model ? [{ ...limit, modelName: model.name }] : [];
        }),
      };
      return HttpResponse.json(body);
    }),
  ),
];
