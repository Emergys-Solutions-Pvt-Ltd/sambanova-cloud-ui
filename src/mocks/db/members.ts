import { type PaginatedResponse } from "@/lib/api/types";
import {
  type AssignableRole,
  type PermissionArea,
  type PermissionSet,
  type Project,
  type ProjectInvitation,
  type ProjectMember,
  type ProjectRole,
  type ProjectRoleDefinition,
  type SettingsListParams,
} from "@/types/domain";

import {
  INVITATION_TTL_DAYS,
  PROJECT_ROLES,
  ROLE_DEFAULTS,
  ROLE_META,
  SEED_INVITATIONS,
  SEED_TEAMMATES,
} from "../fixtures/project-settings";

import { isFixtureProject } from "./projects";

/**
 * Project teams (members, invitations, role permissions), kept per account and project in
 * localStorage (`sn:mock-project-members`). The real API stores one team per project; here each
 * account sees its own copy. A project is seeded the first time it is read: the account becomes
 * its Owner, and the shared fixture projects also get the Figma teammates and invitations.
 */
const MEMBERS_KEY = "sn:mock-project-members";
const DAY_MS = 86_400_000;

/** The account acting on the mock API. */
export interface MockActor {
  id: string;
  name: string;
  email: string;
}

interface StoredMember {
  id: string;
  /** Set on the membership of a mock account (the owner). */
  accountId?: string;
  name: string;
  email: string;
  role: ProjectRole;
  joinedAt: string;
  /** `null` = follows the role's defaults. */
  permissions: PermissionSet | null;
}

interface StoredInvitation {
  id: string;
  email: string;
  role: AssignableRole;
  invitedAt: string;
  expiresAt: string;
}

interface ProjectTeam {
  members: StoredMember[];
  invitations: StoredInvitation[];
  /** Per-project defaults of the editable roles; Owner is fixed. */
  roles: Record<AssignableRole, PermissionSet>;
}

type TeamsByAccount = Record<string, Record<string, ProjectTeam>>;

function read(): TeamsByAccount {
  try {
    return JSON.parse(localStorage.getItem(MEMBERS_KEY) ?? "{}") as TeamsByAccount;
  } catch {
    return {};
  }
}

const write = (value: TeamsByAccount) => localStorage.setItem(MEMBERS_KEY, JSON.stringify(value));

const shortId = (prefix: string) => `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
const normalizeEmail = (email: string) => email.trim().toLowerCase();
const addDays = (iso: string, days: number) =>
  new Date(new Date(iso).getTime() + days * DAY_MS).toISOString();

function seedTeam(actor: MockActor, project: Project): ProjectTeam {
  const created = new Date(project.createdAt).getTime();
  const owner: StoredMember = {
    id: shortId("mem"),
    accountId: actor.id,
    name: actor.name,
    email: actor.email,
    role: "owner",
    joinedAt: project.createdAt,
    permissions: null,
  };
  const fixture = isFixtureProject(project.id);
  const now = Date.now();

  return {
    members: [
      owner,
      ...(fixture
        ? SEED_TEAMMATES.map((seed) => ({
            id: shortId("mem"),
            name: seed.name,
            email: seed.email,
            role: seed.role,
            joinedAt: new Date(created + seed.joinedAfterMinutes * 60_000).toISOString(),
            permissions: null,
          }))
        : []),
    ],
    invitations: fixture
      ? SEED_INVITATIONS.map((seed) => {
          const invitedAt = new Date(now - seed.invitedDaysAgo * DAY_MS).toISOString();
          return {
            id: shortId("inv"),
            email: seed.email,
            role: seed.role,
            invitedAt,
            expiresAt: addDays(invitedAt, INVITATION_TTL_DAYS),
          };
        })
      : [],
    roles: {
      admin: { ...ROLE_DEFAULTS.admin },
      developer: { ...ROLE_DEFAULTS.developer },
      viewer: { ...ROLE_DEFAULTS.viewer },
    },
  };
}

/** Loads the store and the project's team, seeding (and persisting) a team seen for the first time. */
function load(actor: MockActor, project: Project) {
  const all = read();
  const byProject = (all[actor.id] ??= {});
  if (!byProject[project.id]) {
    byProject[project.id] = seedTeam(actor, project);
    write(all);
  }
  return { all, team: byProject[project.id]! };
}

const roleDefaults = (team: ProjectTeam, role: ProjectRole) =>
  role === "owner" ? ROLE_DEFAULTS.owner : team.roles[role];

const AREAS = Object.keys(ROLE_DEFAULTS.owner) as PermissionArea[];
const samePermissions = (a: PermissionSet, b: PermissionSet) =>
  AREAS.every((area) => a[area] === b[area]);

function toMember(stored: StoredMember, team: ProjectTeam, actor: MockActor): ProjectMember {
  return {
    id: stored.id,
    name: stored.name,
    email: stored.email,
    role: stored.role,
    joinedAt: stored.joinedAt,
    permissions: { ...(stored.permissions ?? roleDefaults(team, stored.role)) },
    customPermissions: stored.permissions !== null,
    isYou: stored.accountId === actor.id,
  };
}

function toInvitation(stored: StoredInvitation): ProjectInvitation {
  return {
    ...stored,
    status: new Date(stored.expiresAt).getTime() > Date.now() ? "pending" : "expired",
  };
}

function paginate<T>(items: T[], { page, pageSize }: SettingsListParams): PaginatedResponse<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    page: current,
    pageSize,
    total: items.length,
    totalPages,
  };
}

const matches = (search: string, ...fields: string[]) => {
  const needle = search.trim().toLowerCase();
  return !needle || fields.some((field) => field.toLowerCase().includes(needle));
};

/**
 * What the General tab needs from the team: the owner (shown as Creator), the head count and the
 * actor's own role (always Owner in this mock, since every team is seeded that way).
 */
export function teamSummaryFor(actor: MockActor, project: Project) {
  const { team } = load(actor, project);
  const owner = team.members.find((member) => member.role === "owner");
  const me = team.members.find((member) => member.accountId === actor.id);
  return {
    owner: { name: owner?.name ?? actor.name, email: owner?.email ?? actor.email },
    memberCount: team.members.length,
    myRole: me?.role ?? ("viewer" as ProjectRole),
  };
}

/** Members in join order (the owner first); `search` matches name or email. */
export function listMembersFor(
  actor: MockActor,
  project: Project,
  params: SettingsListParams,
): PaginatedResponse<ProjectMember> {
  const { team } = load(actor, project);
  const rows = team.members
    .filter((member) => matches(params.search, member.name, member.email))
    .map((member) => toMember(member, team, actor));
  return paginate(rows, params);
}

export type MemberChangeResult =
  { status: "ok"; member: ProjectMember } | { status: "not-found" } | { status: "owner" };

/** Changes a member's role (which resets custom permissions) and/or permissions. */
export function updateMemberFor(
  actor: MockActor,
  project: Project,
  memberId: string,
  input: { role?: AssignableRole; permissions?: PermissionSet },
): MemberChangeResult {
  const { all, team } = load(actor, project);
  const member = team.members.find((item) => item.id === memberId);
  if (!member) return { status: "not-found" };
  if (member.role === "owner") return { status: "owner" };

  if (input.role && input.role !== member.role) {
    member.role = input.role;
    member.permissions = null;
  }
  if (input.permissions) {
    member.permissions = samePermissions(input.permissions, roleDefaults(team, member.role))
      ? null
      : { ...input.permissions };
  }
  write(all);
  return { status: "ok", member: toMember(member, team, actor) };
}

export function removeMemberFor(
  actor: MockActor,
  project: Project,
  memberId: string,
): "removed" | "not-found" | "owner" {
  const { all, team } = load(actor, project);
  const index = team.members.findIndex((item) => item.id === memberId);
  if (index === -1) return "not-found";
  if (team.members[index]!.role === "owner") return "owner";
  team.members.splice(index, 1);
  write(all);
  return "removed";
}

/** Invitations, newest first; `search` matches the email. */
export function listInvitationsFor(
  actor: MockActor,
  project: Project,
  params: SettingsListParams,
): PaginatedResponse<ProjectInvitation> {
  const { team } = load(actor, project);
  const rows = team.invitations
    .filter((invitation) => matches(params.search, invitation.email))
    .sort((a, b) => b.invitedAt.localeCompare(a.invitedAt))
    .map(toInvitation);
  return paginate(rows, params);
}

export type InviteResult =
  { status: "ok"; invitation: ProjectInvitation } | { status: "member" } | { status: "pending" };

/** Invites an email; an expired invitation for the same email is replaced. */
export function createInvitationFor(
  actor: MockActor,
  project: Project,
  input: { email: string; role: AssignableRole },
): InviteResult {
  const { all, team } = load(actor, project);
  const email = normalizeEmail(input.email);
  if (team.members.some((member) => normalizeEmail(member.email) === email)) {
    return { status: "member" };
  }
  const existing = team.invitations.find((item) => normalizeEmail(item.email) === email);
  if (existing && toInvitation(existing).status === "pending") return { status: "pending" };

  const invitedAt = new Date().toISOString();
  const invitation: StoredInvitation = {
    id: shortId("inv"),
    email,
    role: input.role,
    invitedAt,
    expiresAt: addDays(invitedAt, INVITATION_TTL_DAYS),
  };
  team.invitations = [invitation, ...team.invitations.filter((item) => item !== existing)];
  write(all);
  return { status: "ok", invitation: toInvitation(invitation) };
}

/** Sends the invitation again: new invite date, a fresh expiry, status back to pending. */
export function resendInvitationFor(
  actor: MockActor,
  project: Project,
  invitationId: string,
): ProjectInvitation | null {
  const { all, team } = load(actor, project);
  const invitation = team.invitations.find((item) => item.id === invitationId);
  if (!invitation) return null;
  invitation.invitedAt = new Date().toISOString();
  invitation.expiresAt = addDays(invitation.invitedAt, INVITATION_TTL_DAYS);
  write(all);
  return toInvitation(invitation);
}

export function cancelInvitationFor(actor: MockActor, project: Project, invitationId: string) {
  const { all, team } = load(actor, project);
  const index = team.invitations.findIndex((item) => item.id === invitationId);
  if (index === -1) return false;
  team.invitations.splice(index, 1);
  write(all);
  return true;
}

export function listRolesFor(actor: MockActor, project: Project): ProjectRoleDefinition[] {
  const { team } = load(actor, project);
  return PROJECT_ROLES.map((role) => ({
    id: role,
    ...ROLE_META[role],
    permissions: { ...roleDefaults(team, role) },
    editable: role !== "owner",
    memberCount: team.members.filter((member) => member.role === role).length,
  }));
}

/**
 * Updates a role's defaults. Members on the role without custom permissions follow them;
 * a member whose custom set now equals the new defaults goes back to following the role.
 */
export function updateRoleFor(
  actor: MockActor,
  project: Project,
  roleId: ProjectRole,
  permissions: PermissionSet,
): ProjectRoleDefinition | "owner" {
  if (roleId === "owner") return "owner";
  const { all, team } = load(actor, project);
  team.roles[roleId] = { ...permissions };
  for (const member of team.members) {
    if (
      member.role === roleId &&
      member.permissions &&
      samePermissions(member.permissions, permissions)
    ) {
      member.permissions = null;
    }
  }
  write(all);
  return listRolesFor(actor, project).find((role) => role.id === roleId)!;
}

/** Drops the team of a deleted project. */
export function deleteTeamFor(actorId: string, projectId: string) {
  const all = read();
  if (!all[actorId]?.[projectId]) return;
  delete all[actorId][projectId];
  write(all);
}
