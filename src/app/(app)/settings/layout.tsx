import { type ReactNode } from "react";

import { PageHeader } from "@/components/layout/page-header";

import { SettingsTabs } from "./settings-tabs";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PageHeader
        title="Project Settings"
        subtitle="Manage your project details and settings."
        className="border-b-0 pb-0"
      />
      <SettingsTabs />
      {children}
    </>
  );
}
