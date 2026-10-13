import Image from "next/image";

import { playgroundArt } from "@/config/assets";

/** The amber glow sits 50px higher while History is open (Figma `1398:118993`); the Chat section is `group/chat`. */
const amberShift =
  "transition-transform duration-(--sn-duration-slow) ease-standard motion-reduce:transition-none " +
  "group-data-[history-open]/chat:-translate-y-12.5";

/**
 * Decorative hero background of the Chat area (Figma: `1398:122074` layers, light `1520:47597`):
 * centred grid, purple glow bottom-left, amber glow top-right, dark/white vignettes in the
 * top-left and bottom-right corners. Each layer keeps its Figma box and is anchored to its
 * corner; the image overflows the box by the blur margin baked into the export. Themed pairs
 * stay lazily loaded, so only the visible theme downloads (no `priority`, decision in §3.3).
 */
export function HeroBackdrop() {
  const { grid, glowPurple, glowAmber, vignetteTopLeft, vignetteBottomRight } = playgroundArt;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Grid (Vector): centred. */}
      <div className="absolute top-[calc(50%-488.5px)] left-[calc(50%-623px)] h-[1030.394px] w-[1237px]">
        <div className="absolute inset-0 show-in-dark">
          <Image src={grid.dark} alt="" fill unoptimized />
        </div>
        <div className="absolute inset-0 show-in-light">
          <Image src={grid.light} alt="" fill unoptimized />
        </div>
      </div>

      {/* Purple glow (Polygon 2): bottom-left, both themes. */}
      <div className="absolute bottom-[-221.04px] left-[-39.39px] flex h-[575.473px] w-[484.997px] items-center justify-center">
        <div className="flex-none rotate-[92.26deg]">
          <div className="relative h-[463.397px] w-[557.658px]">
            <div className="absolute inset-[-151.06%_-125.53%]">
              <Image src={glowPurple.src} alt="" fill unoptimized fetchPriority="high" />
            </div>
          </div>
        </div>
      </div>

      {/* Amber glow (Polygon 3): top-right; the light shape is larger and fainter. */}
      <div className={`absolute top-[-249px] right-[-48px] show-in-dark ${amberShift}`}>
        <div className="flex h-[575.473px] w-[484.997px] items-center justify-center">
          <div className="flex-none rotate-[-87.74deg]">
            <div className="relative h-[463.397px] w-[557.658px]">
              <div className="absolute inset-[-151.06%_-125.53%]">
                <Image src={glowAmber.dark} alt="" fill unoptimized />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={`absolute top-[-249.56px] right-[-62.31px] show-in-light ${amberShift}`}>
        <div className="flex h-[611.061px] w-[514.99px] items-center justify-center">
          <div className="flex-none rotate-[-87.74deg]">
            <div className="relative h-[492.054px] w-[592.144px]">
              <div className="absolute inset-[-142.26%_-118.21%]">
                <Image src={glowAmber.light} alt="" fill unoptimized />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vignette TL (Ellipse 186). */}
      <div className="absolute top-[-68px] left-[-52px] h-[266px] w-[289px]">
        <div className="absolute inset-[-35.08%_-32.28%] show-in-dark">
          <Image src={vignetteTopLeft.dark} alt="" fill unoptimized />
        </div>
        <div className="absolute inset-[-35.08%_-32.28%] show-in-light">
          <Image src={vignetteTopLeft.light} alt="" fill unoptimized />
        </div>
      </div>

      {/* Vignette BR (Ellipse 185). */}
      <div className="absolute right-[-78px] bottom-[-47px] h-[240px] w-[259px]">
        <div className="absolute inset-[-38.88%_-36.02%_-38.87%_-36.02%] show-in-dark">
          <Image src={vignetteBottomRight.dark} alt="" fill unoptimized />
        </div>
        <div className="absolute inset-[-38.88%_-36.02%_-38.87%_-36.02%] show-in-light">
          <Image src={vignetteBottomRight.light} alt="" fill unoptimized />
        </div>
      </div>
    </div>
  );
}
