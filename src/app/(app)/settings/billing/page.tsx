import type { Metadata } from "next";

export const metadata: Metadata = { title: "Billing · Project Settings" };

export default function SettingsBillingPage() {
  return (
    <section aria-labelledby="settings-billing">
      <h2 id="settings-billing" className="text-lg font-semibold">
        Billing
      </h2>
      <p className="opacity-70">Payment methods, credits and invoices.</p>
    </section>
  );
}
