import { notFound } from "next/navigation";
import { type ReactNode } from "react";

/** Developer tools (API demo, token preview). Not available in production builds. */
export default function DevLayout({ children }: { children: ReactNode }) {
  if (process.env.NODE_ENV !== "development") notFound();
  return <main className="flex-1 p-6">{children}</main>;
}
