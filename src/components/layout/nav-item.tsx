"use client";

import Link from "next/link";

import { Icon } from "@/components/ui/icon/icon";
import { Tooltip } from "@/components/ui/tooltip";
import { type NavItem as NavItemConfig } from "@/config/navigation";
import { cn } from "@/lib/cn";

interface NavItemProps {
  item: NavItemConfig;
  active: boolean;
  /** Icon-only rail: label moves to a tooltip and the accessible name. */
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function NavItem({ item, active, collapsed, onNavigate }: NavItemProps) {
  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? item.label : undefined}
      className={cn(
        "flex items-center rounded-sm text-label transition-colors duration-(--sn-duration-fast) ease-standard",
        collapsed ? "size-11 justify-center" : "min-h-10 w-full gap-2 p-2.5",
        active
          ? "bg-active font-semibold text-nav-active"
          : "text-secondary hover:bg-hover hover:text-primary",
      )}
    >
      <Icon name={item.icon} size="md" />
      {!collapsed && <span className="min-w-0 truncate">{item.label}</span>}
    </Link>
  );

  return collapsed ? <Tooltip content={item.label}>{link}</Tooltip> : link;
}
