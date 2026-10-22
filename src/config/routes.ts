/** Single source of truth for app routes, used by navigation and the auth proxy. */
export const routes = {
  dashboard: "/dashboard",
  playground: "/playground",
  apiKeys: "/api-keys",
  usage: "/usage",
  pricing: "/pricing",
  settings: "/settings",
  settingsGeneral: "/settings/general",
  settingsMembers: "/settings/members",
  settingsInvitations: "/settings/members/invitations",
  settingsRoles: "/settings/members/roles",
  settingsLimits: "/settings/limits",
  settingsBilling: "/settings/billing",
  projects: "/projects",
  login: "/login",
  signup: "/signup",
} as const;

export type AppRoute = (typeof routes)[keyof typeof routes];

/**
 * Routes that need a signed-in user. Guests can browse the rest (the Figma
 * guest dashboard shows "Sign Up for Free" in the sidebar instead of a profile).
 * Provisional: confirm the list with product before Auth0 is wired up.
 */
export const protectedRoutePrefixes: readonly string[] = [
  routes.apiKeys,
  routes.usage,
  routes.settings,
  routes.projects,
];

export const settingsTabs = [
  { label: "General", href: routes.settingsGeneral },
  { label: "Members", href: routes.settingsMembers },
  { label: "Limits", href: routes.settingsLimits },
  { label: "Billing", href: routes.settingsBilling },
] as const;

/** Sub-views of Project Settings › Members (Figma: All Members / Invitations / Roles). */
export const membersTabs = [
  { label: "All Members", href: routes.settingsMembers },
  { label: "Invitations", href: routes.settingsInvitations },
  { label: "Roles", href: routes.settingsRoles },
] as const;
