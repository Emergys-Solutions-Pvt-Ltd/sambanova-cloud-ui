"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { settingsTabs } from "@/config/routes";
import { cn } from "@/lib/cn";

/** Route-based tabs so each settings section is deep-linkable. */
export function SettingsTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Project settings"
      className="overflow-x-auto border-b border-default px-4 sm:px-6"
    >
      <ul className="flex min-w-max gap-6">
        {settingsTabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px block border-b-2 px-1 py-3 text-label",
                  active
                    ? "border-brand font-semibold text-primary"
                    : "border-transparent text-muted hover:text-primary",
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
