"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { settingsTabs } from "@/config/routes";

/** Route-based tabs so each settings section is deep-linkable. Restyled in Work Area D. */
export function SettingsTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Project settings">
      <ul className="flex gap-4 border-b border-default">
        {settingsTabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "block border-b-2 border-brand pb-2 font-semibold text-primary"
                    : "block pb-2 text-muted hover:text-primary"
                }
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
