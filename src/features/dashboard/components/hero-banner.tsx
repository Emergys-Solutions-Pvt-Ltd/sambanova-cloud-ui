import Image from "next/image";

import { Button } from "@/components/ui/button";
import { illustrations } from "@/config/assets";
import { routes } from "@/config/routes";

/** Dashboard hero: the page's <h1>, three quick actions and the animated-wave artwork. */
export function HeroBanner() {
  const wave = illustrations.heroWave;

  return (
    <section
      aria-labelledby="dashboard-hero"
      className="relative overflow-hidden rounded-lg border border-default bg-hero px-4 py-6 sm:p-7.5"
    >
      {/* Decorative; hidden below desktop width, and each theme shows its own variant. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-3 right-0 hidden lg:block"
      >
        <Image
          src={wave.dark}
          alt=""
          width={wave.width}
          height={wave.height}
          priority
          className="show-in-dark max-w-none"
        />
        <Image
          src={wave.light}
          alt=""
          width={wave.lightWidth}
          height={wave.lightHeight}
          priority
          className="show-in-light max-w-none"
        />
      </div>
      <div className="relative flex flex-col gap-7">
        <div className="flex flex-col gap-1.5">
          <h1 id="dashboard-hero" className="text-heading-xl">
            Build AI applications faster with{" "}
            <span className="text-hero-accent font-semibold tracking-wide">Sambanova.</span>
          </h1>
          <p className="text-body-sm text-secondary">
            Blazing fast inference. Enterprise ready. Built for developers.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Button href={routes.playground} variant="glass" rightIcon="arrow-right">
            Open Playground
          </Button>
          <Button href={routes.apiKeys} variant="glass" rightIcon="arrow-right">
            Create API Key
          </Button>
          <Button href={routes.settingsBilling} variant="glass" rightIcon="arrow-right">
            Add Credits
          </Button>
        </div>
      </div>
    </section>
  );
}
