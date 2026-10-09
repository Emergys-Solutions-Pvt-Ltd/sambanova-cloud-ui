import type { Metadata } from "next";

export const metadata: Metadata = { title: "Limits · Project Settings" };

export default function SettingsLimitsPage() {
  return (
    <section aria-labelledby="settings-limits">
      <h2 id="settings-limits" className="text-heading-sm">
        Limits
      </h2>
      <p className="text-muted">Rate limits for this project.</p>
    </section>
  );
}
