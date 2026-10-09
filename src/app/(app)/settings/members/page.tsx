import type { Metadata } from "next";

export const metadata: Metadata = { title: "Members · Project Settings" };

export default function SettingsMembersPage() {
  return (
    <section aria-labelledby="settings-members">
      <h2 id="settings-members" className="text-lg font-semibold">
        Members
      </h2>
      <p className="opacity-70">Invite and manage project members.</p>
    </section>
  );
}
