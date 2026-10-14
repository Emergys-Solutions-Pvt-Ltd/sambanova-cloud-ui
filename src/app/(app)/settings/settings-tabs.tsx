"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { settingsTabs } from "@/config/routes";
import { cn } from "@/lib/cn";

/**
 * Route-based tabs so each settings section is deep-linkable (Figma `1387:65939`: 14px labels,
 * 10px sides, 1px underline on the active tab). A tab stays active on its nested routes.
 */
export function SettingsTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Project settings"
      className="scrollbar-thin overflow-x-auto border-b border-hairline px-4 sm:px-6"
    >
      <ul className="flex min-w-max gap-2">
        {settingsTabs.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px block border-b px-2.5 pt-2.5 pb-3 text-body leading-[1.2]",
                  "transition-colors duration-(--sn-duration-fast) ease-standard",
                  active
                    ? "border-current text-primary"
                    : "border-transparent text-tab-inactive hover:text-primary",
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
