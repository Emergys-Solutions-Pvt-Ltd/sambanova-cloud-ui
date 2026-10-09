import type { Metadata } from "next";

export const metadata: Metadata = { title: "General · Project Settings" };

export default function SettingsGeneralPage() {
  return (
    <section aria-labelledby="settings-general">
      <h2 id="settings-general" className="text-lg font-semibold">
        General
      </h2>
      <p className="opacity-70">Project name and details.</p>
    </section>
  );
}
