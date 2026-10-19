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
    artOffset: { x: -4.16, y: 0.26 },
    connector: { left: 116.5, top: 31.78 },
  },
  {
    title: "Add Credits",
    description: "Add credits to your account to unlock higher usage and advanced capabilities.",
    art: illustrations.onboardingCredits,
    artOffset: { x: -8.3, y: 0.02 },
    connector: { left: 107.5, top: 34.5 },
  },
  {
    title: "Create API Key",
    description: "Generate your API key to access our powerful models programmatically.",
    art: illustrations.onboardingApiKey,
    artOffset: { x: -4.27, y: 0.61 },
    connector: { left: 119.5, top: 34.75 },
  },
  {
    title: "Build Your First App",
    description: "Integrate the API into your application and bring your AI ideas to life.",
    art: illustrations.onboardingBuildApp,
    artOffset: { x: -4.06, y: -0.39 },
    connector: null,
  },
] as const;

/** Figma places each illustration by hand, a few px off its column; offsets are from the column's top left, in px. */
const px = (value: number) => `calc(var(--spacing) * ${value / 4})`;

/**
 * Dashed wave with an arrowhead pointing to the next step (Figma: Line 44, 160 x 17). Its box sits
 * at a slightly different spot after each icon, so the offsets come from the design; decorative and
 * only drawn where there is room (xl and up).
 */
function Connector({ left, top }: { left: number; top: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        left: px(left),
        top: px(top),
      }}
      className="pointer-events-none absolute hidden h-[17.072px] w-[160.272px] steps-connector xl:block"
    />
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
          className="relative px-4 pt-5.75 pb-6.5 sm:px-7.5"
        >
          <h2 id="onboarding-title" className="sr-only">
            Get started in four steps
          </h2>
          <button
            type="button"
            onClick={() => toggle(true)}
            className="absolute top-3.25 right-3.75 z-raised flex items-center gap-1.5 rounded-xs text-caption font-medium text-primary hover:text-secondary"
          >
            <Icon name="collapse" size={14} />
            Hide Steps
          </button>

          <ol className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4 xl:gap-x-23.5">
            {steps.map((step, index) => (
              <li key={step.title} className="relative flex flex-col">
                <div
                  style={{ translate: `${px(step.artOffset.x)} ${px(step.artOffset.y)}` }}
                  className="flex h-16.5 items-start"
                >
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
                {step.connector && <Connector {...step.connector} />}
                <p aria-hidden="true" className="mb-2 text-body-sm font-semibold text-secondary">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <div className="flex flex-col gap-1.5">
                  <h3 className="h-[13.888px] text-body-sm leading-[1.2] font-semibold text-secondary">
                    <span className="sr-only">Step {index + 1}: </span>
                    {step.title}
                  </h3>
                  <p className="max-w-50 text-tiny leading-3.5 text-muted">{step.description}</p>
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
