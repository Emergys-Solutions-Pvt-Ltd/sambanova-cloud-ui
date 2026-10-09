import type { Metadata } from "next";

import { DeveloperQuickstart } from "@/features/dashboard/components/developer-quickstart";
import { FreeCreditsCard } from "@/features/dashboard/components/free-credits-card";
import { HeroBanner } from "@/features/dashboard/components/hero-banner";
import { OnboardingSteps } from "@/features/dashboard/components/onboarding-steps";
import { PartnersSection } from "@/features/dashboard/components/partners-section";
import { RecommendedModels } from "@/features/dashboard/components/recommended-models";
import { UsageOverview } from "@/features/dashboard/components/usage-overview";
import { WebinarCarousel } from "@/features/dashboard/components/webinar-carousel";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6">
      <HeroBanner />
      <OnboardingSteps />
      <UsageOverview />
      <div className="grid gap-6 lg:grid-cols-[1fr_calc(var(--spacing)*98)]">
        <WebinarCarousel />
        <FreeCreditsCard />
      </div>
      <DeveloperQuickstart />
      <PartnersSection />
      <RecommendedModels />
    </div>
  );
}
