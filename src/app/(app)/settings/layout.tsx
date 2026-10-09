import { type ReactNode } from "react";

import { PagePlaceholder } from "@/components/layout/page-placeholder";

import { SettingsTabs } from "./settings-tabs";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <PagePlaceholder title="Project Settings" />
      <SettingsTabs />
      {children}
    </div>
  );
}
