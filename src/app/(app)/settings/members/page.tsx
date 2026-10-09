import type { Metadata } from "next";

export const metadata: Metadata = { title: "Members · Project Settings" };

export default function SettingsMembersPage() {
  return (
    <section aria-labelledby="settings-members">
      <h2 id="settings-members" className="text-heading-sm">
        Members
      </h2>
      <p className="text-muted">Invite and manage project members.</p>
    </section>
  );
}
