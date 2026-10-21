"use client";

import Image from "next/image";

import { InfercomLogo } from "@/components/brand/infercom-logo";
import { SectionHeader } from "@/components/layout/section-header";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import { type CloudPartner } from "@/types/domain";

import { usePartners } from "../hooks/use-dashboard-data";

/**
 * Artwork and logo files per partner. The art files are the Figma crop of each picture, transparent
 * margin included, exported at 2x; `width` / `height` are the Figma box in CSS px, `position` is
 * where that box sits (right edge at -1px, vertically centred or 11.9px from the top).
 */
const artwork: Record<
  CloudPartner["id"],
  {
    art: { src: string; width: number; height: number; position: string };
    logo: React.ReactNode;
  }
> = {
  infercom: {
    art: {
      src: "/dashboard/partner-infercom-card-art.webp",
      width: 130.18,
      height: 138.39,
      position: "top-1/2 -translate-y-1/2",
    },
    logo: <InfercomLogo aria-hidden="true" className="h-6 w-auto text-primary" />,
  },
  argylldata: {
    art: {
      src: "/dashboard/partner-argylldata-card-art.webp",
      width: 130,
      height: 137.89,
      position: "top-[11.9px]",
    },
    logo: (
      <>
        <Image
          src="/dashboard/logo-argylldata-dark.webp"
          alt=""
          width={113}
          height={30}
          className="show-in-dark"
        />
        <Image
          src="/dashboard/logo-argylldata-light.webp"
          alt=""
          width={113}
          height={30}
          className="show-in-light"
        />
      </>
    ),
  },
  scx: {
    art: {
      src: "/dashboard/partner-scx-card-art.webp",
      width: 121.96,
      height: 131.77,
      position: "top-1/2 -translate-y-1/2",
    },
    logo: (
      <>
        <Image
          src="/dashboard/logo-scx-dark.webp"
          alt=""
          width={72}
          height={26}
          className="show-in-dark"
        />
        <Image
          src="/dashboard/logo-scx-light.webp"
          alt=""
          width={72}
          height={26}
          className="show-in-light"
        />
      </>
    ),
  },
};

function PartnerCard({ partner }: { partner: CloudPartner }) {
  const { art, logo } = artwork[partner.id];

  return (
    <Card
      as="article"
      padding="lg"
      className={cn(
        "group/card relative flex h-full min-h-41.75 flex-col justify-between gap-4 overflow-hidden",
        // Figma hover (slow smart-animate): the border turns brand purple and the arrow slides through.
        "transition-colors duration-(--sn-duration-marquee) ease-standard hover:border-brand-hover motion-reduce:transition-none",
      )}
    >
      <div
        aria-hidden="true"
        className={cn("pointer-events-none absolute -right-px hidden sm:block", art.position)}
      >
        <Image
          src={art.src}
          alt=""
          width={art.width}
          height={art.height}
          style={{ width: art.width, height: art.height }}
        />
      </div>
      {/* 220px like Figma, but never into the artwork when the card is narrower than 370px. */}
      <div className="relative flex max-w-55 flex-col gap-4 sm:max-w-[min(13.75rem,calc(100%-6.75rem))]">
        <h3 className="sr-only">{partner.name}</h3>
        <div className="flex h-7.5 items-center">{logo}</div>
        <p className="text-body-sm text-muted">{partner.description}</p>
      </div>
      <div className="relative">
        <ArrowLink
          size="sm"
          arrow="marquee"
          href={partner.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Explore {partner.name}
        </ArrowLink>
      </div>
    </Card>
  );
}

export function PartnersSection() {
  const { data, error, refetch } = usePartners();

  return (
    <section aria-labelledby="partners-title" className="flex flex-col gap-4">
      <SectionHeader
        id="partners-title"
        title="Explore Our Cloud Partners"
        description="Access trusted partner platforms built to extend and accelerate your AI workflows."
      />

      {error ? (
        <ErrorState message="Couldn’t load cloud partners." onRetry={() => void refetch()} />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data
            ? data.map((partner) => (
                <li key={partner.id}>
                  <PartnerCard partner={partner} />
                </li>
              ))
            : [0, 1, 2].map((key) => (
                <li key={key}>
                  <Skeleton className="h-41.75 rounded-lg" />
                </li>
              ))}
        </ul>
      )}
    </section>
  );
}
