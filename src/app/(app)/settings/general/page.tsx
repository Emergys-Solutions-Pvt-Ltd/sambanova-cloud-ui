import type { Metadata } from "next";

export const metadata: Metadata = { title: "General · Project Settings" };

export default function SettingsGeneralPage() {
  return (
    <section aria-labelledby="settings-general">
      <h2 id="settings-general" className="text-heading-sm">
        General
      </h2>
      <p className="text-muted">Project name and details.</p>
    </section>
  );
}
