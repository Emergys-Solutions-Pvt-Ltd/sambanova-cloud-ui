import type { Metadata } from "next";

export const metadata: Metadata = { title: "Billing · Project Settings" };

export default function SettingsBillingPage() {
  return (
    <section aria-labelledby="settings-billing">
      <h2 id="settings-billing" className="text-heading-sm">
        Billing
      </h2>
      <p className="text-muted">Payment methods, credits and invoices.</p>
    </section>
  );
}
