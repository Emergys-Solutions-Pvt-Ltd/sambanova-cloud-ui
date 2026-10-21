import Image from "next/image";

import { heroGlows, illustrations } from "@/config/assets";

import { HeroActions } from "./hero-actions";

/** Dashboard hero: the page's <h1>, three quick actions and the animated-wave artwork. */
export function HeroBanner() {
  const wave = illustrations.heroWave;
  const { left: glowLeft, right: glowRight } = heroGlows;

  return (
    <section
      aria-labelledby="dashboard-hero"
      className="relative overflow-hidden rounded-lg border border-default bg-hero px-4 py-6 sm:p-7.5"
    >
      {/*
        Decorative artwork, hidden below desktop width. Dark theme (Figma `1907:196251`): a glow
        behind the title, the wave and a second glow over it; each layer keeps its Figma box (the
        glows include their blur margin). Light theme keeps its own wave.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-100.8px] left-[-182.5px] hidden h-[386.4px] w-[497.949px] -scale-x-100 lg:show-in-dark"
      >
        <Image src={glowLeft.src} alt="" fill unoptimized />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-2.75 -right-15.5 hidden lg:show-in-dark"
      >
        <Image
          src={wave.dark}
          alt=""
          width={wave.width}
          height={wave.height}
          priority
          className="max-w-none"
        />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-3 right-0 hidden lg:show-in-light"
      >
        <Image
          src={wave.light}
          alt=""
          width={wave.lightWidth}
          height={wave.lightHeight}
          priority
          className="max-w-none"
        />
      </div>
      <div className="relative flex flex-col gap-7">
        <div className="flex flex-col gap-1.5">
          <h1 id="dashboard-hero" className="text-heading-xl">
            Build AI applications faster with{" "}
            <span className="inline-block text-hero-accent font-semibold tracking-wide">
              Sambanova.
            </span>
          </h1>
          <p className="text-body-sm text-secondary">
            Blazing fast inference. Enterprise ready. Built for developers.
          </p>
        </div>

        <HeroActions />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-93.7px] right-[-151.6px] hidden h-[372.887px] w-[891.285px] lg:show-in-dark"
      >
        <Image src={glowRight.src} alt="" fill unoptimized />
      </div>
    </section>
  );
}
