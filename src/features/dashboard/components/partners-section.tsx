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

/** Artwork and logo files per partner (exported from Figma, shown at 1x size). */
const artwork: Record<
  CloudPartner["id"],
  { art: { src: string; width: number; height: number }; logo: React.ReactNode }
> = {
  infercom: {
    art: { src: "/dashboard/partner-infercom-art.webp", width: 130, height: 138 },
    logo: <InfercomLogo aria-hidden="true" className="h-6 w-auto text-primary" />,
  },
  argylldata: {
    art: { src: "/dashboard/partner-argylldata-art.webp", width: 130, height: 138 },
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
    art: { src: "/dashboard/partner-scx-art.webp", width: 130, height: 138 },
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
        "group/card relative flex min-h-41.75 flex-col justify-between gap-4 overflow-hidden",
        // Figma hover (slow smart-animate): the border turns brand purple and the arrow slides through.
        "transition-colors duration-(--sn-duration-marquee) ease-standard hover:border-brand-hover motion-reduce:transition-none",
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-3.5 right-0 hidden sm:block"
      >
        <Image
          src={art.src}
          alt=""
          width={art.width}
          height={art.height}
          style={{ height: art.height }}
        />
      </div>
      <div className="relative flex max-w-55 flex-col gap-4">
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
