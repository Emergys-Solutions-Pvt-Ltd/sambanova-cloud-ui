import { type IconName } from "@/components/ui/icon/icon";
import {
  type AssignableRole,
  type PermissionArea,
  type PermissionLevel,
  type PermissionSet,
  type ProjectRole,
} from "@/types/domain";

export interface PermissionAreaConfig {
  id: PermissionArea;
  label: string;
  /** Info-icon tooltip. Figma draws the icon without text, so the copy is ours. */
  description: string;
  /** Levels offered for the area, in Figma's order. Mirrors the API's rules. */
  levels: readonly PermissionLevel[];
}

/** Rows of the Edit Permissions dialog, in Figma's order (`1387:66867`). */
export const PERMISSION_AREAS: readonly PermissionAreaConfig[] = [
  {
    id: "models",
    label: "Models",
    description: "Call models through the API. View Only lists models and their details.",
    levels: ["use", "view", "none"],
  },
  {
    id: "playground",
    label: "Playground",
    description: "Chat with models and compare them in the Playground.",
    levels: ["use", "none"],
  },
  {
    id: "agenticAi",
    label: "Agentic AI",
    description: "Build and run agents.",
    levels: ["use", "none"],
  },
  {
    id: "apiKeys",
    label: "API Keys",
    description: "Manage creates, edits, rotates and deletes keys. View Only lists them.",
    levels: ["manage", "view", "none"],
  },
  {
    id: "projects",
    label: "Projects",
    description: "Manage edits this project's settings, members and roles. View Only sees them.",
    levels: ["manage", "view", "none"],
  },
  {
    id: "usage",
    label: "Usage & Analytics",
    description: "See token usage, requests and spend for this project.",
    levels: ["view", "none"],
  },
  {
    id: "billing",
    label: "Billing & Credits",
    description: "Manage adds credits and payment details. View Only sees balance and invoices.",
    levels: ["manage", "view", "none"],
  },
];

export const LEVEL_LABELS: Record<PermissionLevel, string> = {
  manage: "Manage",
  use: "Use",
  view: "View Only",
  none: "No Access",
};

export const ROLE_LABELS: Record<ProjectRole, string> = {
  owner: "Owner",
  admin: "Admin",
  developer: "Developer",
  viewer: "Viewer",
};

/** Roles that can be given in Change Role and Invite Member (ownership can't be transferred). */
export const ASSIGNABLE_ROLES: readonly AssignableRole[] = ["admin", "developer", "viewer"];

/** Role card glyphs (Figma: crown, half shield, code, eye). */
export const ROLE_ICONS: Record<ProjectRole, IconName> = {
  owner: "crown",
  admin: "shield-half",
  developer: "code",
  viewer: "eye",
};

export const samePermissions = (a: PermissionSet, b: PermissionSet) =>
  PERMISSION_AREAS.every(({ id }) => a[id] === b[id]);

/** Areas the role can reach at all, in dialog order (Figma's "Key capabilities" row). */
export function capabilitiesOf(permissions: PermissionSet) {
  return PERMISSION_AREAS.filter(({ id }) => permissions[id] !== "none").map(({ label }) => label);
}
