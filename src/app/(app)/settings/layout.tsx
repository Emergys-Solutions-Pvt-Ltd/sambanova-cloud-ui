import { type ReactNode } from "react";

import { SettingsHeader } from "@/features/settings";

import { SettingsTabs } from "./settings-tabs";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SettingsHeader />
      <SettingsTabs />
      {children}
    </>
  );
}
