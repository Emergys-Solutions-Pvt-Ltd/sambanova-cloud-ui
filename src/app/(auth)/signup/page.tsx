import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  return <PagePlaceholder title="Sign up" description="Create your SambaNova Cloud account." />;
}
