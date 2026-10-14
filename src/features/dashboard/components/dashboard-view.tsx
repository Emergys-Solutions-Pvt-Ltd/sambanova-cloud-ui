import { DeveloperQuickstart } from "./developer-quickstart";
import { FreeCreditsCard } from "./free-credits-card";
import { HeroBanner } from "./hero-banner";
import { OnboardingSteps } from "./onboarding-steps";
import { PartnersSection } from "./partners-section";
import { RecommendedModels } from "./recommended-models";
import { UsageOverview } from "./usage-overview";
import { WebinarCarousel } from "./webinar-carousel";

/** The dashboard page body; also shown behind the login and sign-up dialog. */
export function DashboardView() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6">
      <HeroBanner />
      <OnboardingSteps />
      <UsageOverview />
      <div className="grid gap-6 xl:grid-cols-[1fr_calc(var(--spacing)*98)]">
        <WebinarCarousel />
        <FreeCreditsCard />
      </div>
      <DeveloperQuickstart />
      <PartnersSection />
      <RecommendedModels />
    </div>
  );
}
