"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/ui/icon/icon";
import { illustrations } from "@/config/assets";
import { cn } from "@/lib/cn";
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

/** Dashed rule on either side of the "Show Steps" pill (Figma: 1px, 6/6 dash, round caps). */
function DashedRule() {
  return (
    <svg aria-hidden="true" className="h-px min-w-0 flex-1 text-(--sn-border-dashed)">
      <line
        x1="0"
        y1="0.5"
        x2="100%"
        y2="0.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="6 6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Four-step getting-started strip (Figma: "Steps Animation", smart-animate, 0.4s linear).
 * "Hide Steps" shrinks the card into a centered "Show Steps" pill: the card box narrows
 * and rounds off while its content stays put and is clipped by it, the pill label drops in
 * from above, the dashed rules fade in, and the section height collapses so the page
 * below follows. The choice is remembered (useUIStore).
 */
export function OnboardingSteps() {
  const hidden = useUIStore(selectOnboardingStepsHidden);
  const setHidden = useUIStore((state) => state.setOnboardingStepsHidden);

  // Only animate changes the user makes, not the stored state being restored on load.
  const [animate, setAnimate] = useState(false);
  // Natural (expanded) height of the content, so the section can transition to and from it.
  const contentRef = useRef<HTMLDivElement>(null);
  const [fullHeight, setFullHeight] = useState<number>();

  useEffect(() => {
    const node = contentRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      setFullHeight(entry?.borderBoxSize[0]?.blockSize ?? node.offsetHeight);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const toggle = (nextHidden: boolean) => {
    setAnimate(true);
    setHidden(nextHidden);
  };

  const motion = animate
    ? "transition-[width,height,border-radius,border-color,opacity,clip-path,translate] duration-(--sn-duration-collapse) ease-linear motion-reduce:transition-none"
    : "";

  return (
    <div
      style={hidden ? undefined : { height: fullHeight }}
      className={cn("relative", hidden && "h-steps-pill", motion)}
    >
      {/* Card box: full width at rest, a pill when hidden. */}
      <div
        aria-hidden="true"
        style={hidden ? undefined : { height: fullHeight }}
        className={cn(
          "absolute top-0 left-1/2 -translate-x-1/2 border bg-surface",
          hidden
            ? "h-steps-pill w-steps-pill rounded-full border-pill"
            : "w-full rounded-lg border-default",
          motion,
        )}
      />

      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-x-0 top-0 flex h-steps-pill items-center gap-2",
          hidden ? "opacity-100" : "opacity-0",
          motion,
        )}
      >
        <DashedRule />
        <span className="w-steps-pill shrink-0" />
        <DashedRule />
      </div>

      <div
        ref={contentRef}
        className={cn(
          "relative border border-transparent",
          hidden ? "steps-clip-pill" : "steps-clip-open",
          motion,
        )}
      >
        <section
          aria-labelledby="onboarding-title"
          inert={hidden}
          className="px-4 pt-4 pb-6 sm:px-7.5"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 id="onboarding-title" className="sr-only">
              Get started in four steps
            </h2>
            <span aria-hidden="true" />
            <button
              type="button"
              onClick={() => toggle(true)}
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
        </section>

        {/* The pill's label sits above the card and drops in as the card shrinks around it. */}
        <button
          type="button"
          inert={!hidden}
          onClick={() => toggle(false)}
          className="absolute top-0 left-1/2 flex h-steps-pill w-steps-pill -translate-x-1/2 items-center justify-center rounded-full text-caption font-bold text-primary hover:bg-hover"
        >
          <span
            className={cn(
              hidden ? "translate-y-0" : "-translate-y-[calc(100%+var(--sn-steps-pill-height))]",
              motion,
            )}
          >
            Show Steps
          </span>
        </button>
      </div>
    </div>
  );
}
