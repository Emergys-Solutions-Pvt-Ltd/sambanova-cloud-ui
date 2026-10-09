import { type ReactNode } from "react";
import Link from "next/link";

import { routes } from "@/config/routes";

const navItems = [
  { label: "Dashboard", href: routes.dashboard },
  { label: "Playground", href: routes.playground },
  { label: "API Keys", href: routes.apiKeys },
  { label: "Usage", href: routes.usage },
  { label: "Pricing", href: routes.pricing },
  { label: "Project Settings", href: routes.settings },
  { label: "Projects", href: routes.projects },
];

/**
 * Authenticated app area. Access control runs in src/proxy.ts (stubbed until
 * Auth0). This bare nav is a stand-in; the real shell is built in Work Area D.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1">
      <nav aria-label="Main" className="w-60 shrink-0 border-r border-default bg-sidebar p-4">
        <ul className="flex flex-col gap-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <main id="main-content" className="min-w-0 flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
