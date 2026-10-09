import Link from "next/link";

import { routes } from "@/config/routes";

/** 404 page. Final styling lands after the design tokens (Work Area B). */
export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="font-mono text-sm opacity-50">404</p>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="opacity-70">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link href={routes.dashboard} className="rounded border px-4 py-2">
        Go to Dashboard
      </Link>
    </main>
  );
}
