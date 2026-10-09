"use client";

import Image from "next/image";

import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon/icon";
import { illustrations } from "@/config/assets";
import { selectOnboardingStepsHidden, useUIStore } from "@/stores/ui-store";

const steps = [
  {
    title: "Explore Playground",
    description: "Test Prompts, Compare models, and experience blazing-fast inference or free",
    art: illustrations.onboardingPlayground,
  },
  {
    title: "Add Credits",
    description: "Add credits to your account to unlock higher usage and advanced capabilities.",
    art: illustrations.onboardingCredits,
  },
  {
    title: "Create API Key",
    description: "Generate your API key to access our powerful models programmatically.",
    art: illustrations.onboardingApiKey,
  },
  {
    title: "Build Your First App",
    description: "Integrate the API into your application and bring your AI ideas to life.",
    art: illustrations.onboardingBuildApp,
  },
] as const;

/** Dotted curve between two steps. Decorative; only drawn where there is room (xl and up). */
function Connector() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 160 16"
      fill="none"
      className="pointer-events-none absolute top-7 left-29 hidden h-4 w-40 text-muted xl:block"
    >
      <path
        d="M1 12.5C28 5 46 15 80 9C112 3.5 134 6 159 9.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeDasharray="0.5 5"
      />
    </svg>
  );
}

/** Four-step getting-started strip. Can be hidden; the choice is remembered (useUIStore). */
export function OnboardingSteps() {
  const hidden = useUIStore(selectOnboardingStepsHidden);
  const setHidden = useUIStore((state) => state.setOnboardingStepsHidden);

  if (hidden) {
    return (
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setHidden(false)}
          className="rounded-xs text-caption font-semibold text-accent hover:underline"
        >
          Show Steps
        </button>
      </div>
    );
  }

  return (
    <Card
      as="section"
      aria-labelledby="onboarding-title"
      padding="none"
      className="px-4 pt-4 pb-6 sm:px-7.5"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 id="onboarding-title" className="sr-only">
          Get started in four steps
        </h2>
        <span aria-hidden="true" />
        <button
          type="button"
          onClick={() => setHidden(true)}
          className="flex items-center gap-1.5 rounded-xs text-caption font-medium text-primary hover:text-secondary"
        >
          <Icon name="collapse" size={14} />
          Hide Steps
        </button>
      </div>

      <ol className="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4 xl:gap-x-23.5">
        {steps.map((step, index) => (
          <li key={step.title} className="relative flex flex-col gap-2">
            <div className="flex h-15.75 items-end">
              <Image
                src={step.art.dark}
                alt=""
                width={step.art.width}
                height={step.art.height}
                style={{ height: step.art.height }}
                className="show-in-dark"
              />
              <Image
                src={step.art.light}
                alt=""
                width={step.art.width}
                height={step.art.height}
                style={{ height: step.art.height }}
                className="show-in-light"
              />
            </div>
            {index < steps.length - 1 && <Connector />}
            <p aria-hidden="true" className="mt-2 text-body-sm font-semibold text-secondary">
              {String(index + 1).padStart(2, "0")}
            </p>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-body-sm font-semibold text-secondary">
                <span className="sr-only">Step {index + 1}: </span>
                {step.title}
              </h3>
              <p className="max-w-50 text-tiny text-muted">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
