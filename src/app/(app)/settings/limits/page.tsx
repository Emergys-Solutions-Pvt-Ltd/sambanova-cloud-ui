import type { Metadata } from "next";

export const metadata: Metadata = { title: "Limits · Project Settings" };

export default function SettingsLimitsPage() {
  return (
    <section aria-labelledby="settings-limits">
      <h2 id="settings-limits" className="text-lg font-semibold">
        Limits
      </h2>
      <p className="opacity-70">Rate limits for this project.</p>
    </section>
  );
}
