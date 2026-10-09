"use client";

import { usePathname } from "next/navigation";

import { IconButton } from "@/components/ui/icon-button";
import { Skeleton } from "@/components/ui/skeleton";
import { isNavItemActive, navItems } from "@/config/navigation";
import { cn } from "@/lib/cn";
import { selectSessionStatus, selectUser, useSessionStore } from "@/stores/session-store";

import { GuestFooter } from "./guest-footer";
import { Logo } from "./logo";
import { NavItem } from "./nav-item";
import { ProjectSelector } from "./project-selector";
import { UserMenu } from "./user-menu";

interface SidebarContentProps {
  /** Icon-only rail (tablet). */
  collapsed?: boolean;
  /** Called when a link is followed; the mobile/tablet drawer uses it to close. */
  onNavigate?: () => void;
  /** Rail only: opens the full sidebar in a drawer. */
  onExpand?: () => void;
  expanded?: boolean;
}

function Account({ collapsed }: { collapsed?: boolean }) {
  const status = useSessionStore(selectSessionStatus);
  const user = useSessionStore(selectUser);

  if (status === "authenticated" && user) return <UserMenu user={user} collapsed={collapsed} />;
  if (status === "guest") return <GuestFooter collapsed={collapsed} />;

  // Loading: hold the space so the layout doesn't jump when the session resolves.
  return (
    <div aria-busy="true" aria-label="Loading account">
      {collapsed ? (
        <Skeleton className="size-11 rounded-full" />
      ) : (
        <Skeleton className="h-14 w-full" />
      )}
    </div>
  );
}

/**
 * Everything inside the sidebar: logo, project selector, navigation and the
 * account area. Rendered three ways: the fixed desktop column, the tablet icon
 * rail, and inside the slide-in drawer.
 */
export function SidebarContent({ collapsed, onNavigate, onExpand, expanded }: SidebarContentProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col gap-9.75 pt-6 pb-4",
        collapsed ? "items-center px-3.5" : "px-3",
      )}
    >
      <div className={cn("flex items-center", collapsed ? "flex-col gap-3" : "")}>
        <Logo compact={collapsed} onClick={onNavigate} />
        {collapsed && onExpand && (
          <IconButton
            icon="menu"
            aria-label="Open navigation"
            aria-haspopup="dialog"
            aria-expanded={expanded ?? false}
            onClick={onExpand}
          />
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-between gap-5">
        <div className={cn("flex min-h-0 flex-col gap-3", collapsed && "items-center")}>
          <ProjectSelector collapsed={collapsed} />
          <nav aria-label="Main" className="min-h-0 overflow-y-auto">
            <ul className="flex flex-col gap-0.5">
              {navItems.map((item) => (
                <li key={item.href}>
                  <NavItem
                    item={item}
                    active={isNavItemActive(pathname, item.href)}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                  />
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <Account collapsed={collapsed} />
      </div>
    </div>
  );
}
