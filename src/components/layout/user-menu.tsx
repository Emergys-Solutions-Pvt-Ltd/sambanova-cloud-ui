"use client";

import Link from "next/link";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon/icon";
import { Tooltip } from "@/components/ui/tooltip";
import { externalLinks } from "@/config/links";
import { routes } from "@/config/routes";
import { useLogout } from "@/features/session";
import { formatUsd } from "@/lib/format";
import { cn } from "@/lib/cn";
import { type User } from "@/types/domain";
import {
  selectSetTheme,
  selectTheme,
  type ThemePreference,
  useThemeStore,
} from "@/stores/theme-store";

import { themeOptions, themePillClasses, themeSegmentClasses } from "./theme-switcher";

/** Signed-in account card at the bottom of the sidebar, with the account menu (Figma: Dropdown Menu). */
export function UserMenu({ user, collapsed }: { user: User; collapsed?: boolean }) {
  const theme = useThemeStore(selectTheme);
  const setTheme = useThemeStore(selectSetTheme);
  const logout = useLogout();

  const trigger = collapsed ? (
    <button
      type="button"
      aria-label={`Account menu for ${user.name}`}
      className="flex size-11 items-center justify-center rounded-sm hover:bg-hover"
    >
      <Avatar name={user.name} src={user.avatarUrl} size="sm" />
    </button>
  ) : (
    <button
      type="button"
      className={cn(
        "flex w-full flex-col rounded-sm border border-profile bg-profile p-2.25 text-left",
        "transition-colors duration-(--sn-duration-fast) ease-standard hover:bg-hover",
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-body font-semibold text-primary">{user.name}</span>
        <Badge variant="success" size="sm" aria-label={`${formatUsd(user.creditBalance)} credit`}>
          {formatUsd(user.creditBalance)}
        </Badge>
      </span>
      <span className="truncate text-tiny text-muted">{user.email}</span>
    </button>
  );

  return (
    <DropdownMenu>
      {collapsed ? (
        <Tooltip content={user.name}>
          <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        </Tooltip>
      ) : (
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      )}

      <DropdownMenuContent
        side={collapsed ? "right" : "top"}
        align={collapsed ? "end" : "start"}
        className="w-(--radix-dropdown-menu-trigger-width) min-w-62.5"
      >
        <DropdownMenuLabel className="truncate font-medium">{user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={routes.projects}>
            <Icon name="layers-subtract" size="sm" />
            Manage Projects
          </Link>
        </DropdownMenuItem>

        <div className="flex min-h-11 items-center gap-2 py-1 pr-2 pl-4 text-body text-secondary">
          <Icon name="palette" size="sm" />
          <span id="account-theme-label" className="flex-1">
            Theme
          </span>
          <DropdownMenuRadioGroup
            aria-labelledby="account-theme-label"
            value={theme}
            onValueChange={(value) => setTheme(value as ThemePreference)}
            className={themePillClasses}
          >
            {themeOptions.map((option) => (
              <DropdownMenuRadioItem
                key={option.value}
                value={option.value}
                aria-label={option.label}
                title={option.label}
                // Keep the menu open so the change is visible.
                onSelect={(event) => event.preventDefault()}
                className={themeSegmentClasses}
              >
                <Icon name={option.icon} size={14} />
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </div>

        <DropdownMenuItem asChild>
          <a href={externalLinks.documentation} target="_blank" rel="noopener noreferrer">
            <Icon name="book" size="sm" />
            <span className="flex-1">Documentation</span>
            <Icon name="external-link" size="md" className="text-muted" />
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={externalLinks.helpCenter} target="_blank" rel="noopener noreferrer">
            <Icon name="help" size="sm" />
            <span className="flex-1">Help Center</span>
            <Icon name="external-link" size="md" className="text-muted" />
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={logout}>
          <Icon name="logout" size="sm" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
