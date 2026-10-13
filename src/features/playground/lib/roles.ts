import { type IconName } from "@/components/ui/icon/icon";
import { type QuickRoleId, type SystemPromptSetting } from "@/types/domain";

export interface QuickRole {
  id: QuickRoleId;
  title: string;
  description: string;
  icon: IconName;
  /** Complete literal class strings so Tailwind's scanner sees them. */
  tileClass: string;
  iconClass: string;
}

/** Quick Select cards (Figma: System Prompt `1398:119437`). */
export const QUICK_ROLES: readonly QuickRole[] = [
  {
    id: "developer",
    title: "Developer",
    description: "Generate code, debug issues, and explain technical concepts.",
    icon: "code",
    tileClass: "bg-role-developer/22",
    iconClass: "text-role-developer",
  },
  {
    id: "technical-writer",
    title: "Technical Writer",
    description: "Create documentation, guides, and structured content.",
    icon: "file-text",
    tileClass: "bg-role-writer/22",
    iconClass: "text-role-writer",
  },
  {
    id: "product-manager",
    title: "Product Manager",
    description: "Brainstorm features, write PRDs, and plan roadmaps.",
    icon: "user-star",
    tileClass: "bg-role-pm/22",
    iconClass: "text-role-pm",
  },
];

/** The role with this id, if any. */
export function getRole(id: QuickRoleId | null | undefined) {
  return id ? QUICK_ROLES.find((role) => role.id === id) : undefined;
}

/** Text a Quick Select card writes into the prompt (Figma `1398:119544`): "Title - description". */
export function roleAutofill(role: Pick<QuickRole, "title" | "description">) {
  return `${role.title} - ${role.description}`;
}

/** The role whose auto-fill equals the trimmed prompt (a card stays selected only while it matches). */
export function matchRole(prompt: string) {
  const text = prompt.trim();
  return QUICK_ROLES.find((role) => roleAutofill(role) === text);
}

/** Header subtitle perspective: role title, "Custom" for a hand-written prompt, null when none. */
export function perspectiveLabel(setting: SystemPromptSetting) {
  const role = getRole(setting.roleId);
  if (role) return role.title;
  return setting.prompt.trim() ? "Custom" : null;
}
