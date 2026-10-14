"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

import { membersTabs } from "@/config/routes";
import { cn } from "@/lib/cn";

/** All Members / Invitations / Roles switch (Figma: segmented "Component 107", 97px tabs, links). */
function MembersSubnav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Members">
      <ul className="inline-flex h-9.5 items-center gap-[5px] rounded-item bg-surface-raised p-[3px]">
        {membersTabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-7.75 w-24.25 items-center justify-center rounded-sm text-body-sm leading-[1.4]",
                  "transition-colors duration-(--sn-duration-fast) ease-standard",
                  active
                    ? "bg-selected font-semibold text-on-brand"
                    : "font-medium text-tab-inactive hover:text-primary",
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Row above a Members view: the sub-navigation, and the view's search box on the right. */
export function MembersToolbar({ search }: { search?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <MembersSubnav />
      {search}
    </div>
  );
}
