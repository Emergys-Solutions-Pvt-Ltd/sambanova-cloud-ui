import { type ReactNode } from "react";

/** Signed-out pages (login, signup). Auth0 Universal Login may replace these later. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <main className="flex flex-1 items-center justify-center p-6">{children}</main>;
}
