"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { settingsTabs } from "@/config/routes";

/** Route-based tabs so each settings section is deep-linkable. Restyled in Work Area D. */
export function SettingsTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Project settings">
      <ul className="flex gap-4 border-b">
        {settingsTabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={active ? "block border-b-2 pb-2 font-semibold" : "block pb-2"}
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
