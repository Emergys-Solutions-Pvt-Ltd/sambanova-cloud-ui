import { type IconName } from "@/components/ui/icon/icon-data.generated";

import { routes } from "./routes";

export interface NavItem {
  label: string;
  href: string;
  icon: IconName;
}

/**
 * Sidebar items. No "Agentic AI": it's in the Figma frames but out of scope
 * for this release (product decision). Label is "Pricing" as in the dark
 * dashboard; the light frame says "Plans & Pricing".
 */
export const navItems: readonly NavItem[] = [
  { label: "Dashboard", href: routes.dashboard, icon: "dashboard" },
  { label: "Playground", href: routes.playground, icon: "playground" },
  { label: "API Keys", href: routes.apiKeys, icon: "api-keys" },
  { label: "Usage", href: routes.usage, icon: "usage" },
  { label: "Pricing", href: routes.pricing, icon: "pricing" },
  { label: "Project Settings", href: routes.settings, icon: "settings" },
];

/** A link is active on its own route and on any nested route beneath it. */
export function isNavItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
