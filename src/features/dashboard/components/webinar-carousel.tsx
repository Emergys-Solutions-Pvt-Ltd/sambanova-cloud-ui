"use client";

import Image from "next/image";
import { useState } from "react";

import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Icon } from "@/components/ui/icon/icon";
import { IconButton } from "@/components/ui/icon-button";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import { formatDate, formatTime } from "@/lib/format";

import { useWebinars } from "../hooks/use-dashboard-data";

/**
 * Upcoming-webinar promo with previous/next arrows and dots. No autoplay:
 * moving content is a WCAG concern and Figma shows manual controls only.
 */
export function WebinarCarousel() {
  const { data, error, refetch } = useWebinars();
  const [requested, setRequested] = useState(0);

  if (error) {
    return <ErrorState message="Couldn’t load upcoming webinars." onRetry={() => void refetch()} />;
  }
  if (!data) return <Skeleton className="h-59.75 rounded-lg" />;
  if (data.length === 0) return null;

  const count = data.length;
  // Clamp: the list can shrink between renders.
  const index = Math.min(requested, count - 1);
  const webinar = data[index]!;
  const go = (next: number) => setRequested((next + count) % count);

  return (
    <Card
      as="section"
      aria-roledescription="carousel"
      aria-label="Upcoming webinars"
      padding="lg"
      className="relative flex flex-col gap-5 sm:flex-row"
    >
      <div className="relative size-50.5 shrink-0 self-center overflow-hidden rounded-md border border-switcher-border sm:self-start">
        <Image
          src="/dashboard/webinar.webp"
          alt=""
          width={201}
          height={202}
          className="size-full object-cover"
        />
        <span aria-hidden="true" className="absolute inset-0 bg-tint-promo" />
      </div>

      <article
        aria-roledescription="slide"
        aria-label={`${index + 1} of ${count}`}
        aria-live="polite"
        className="flex min-w-0 flex-1 flex-col justify-between gap-6"
      >
        <div className="flex flex-col gap-3">
          <p className="inline-flex h-5.25 w-fit items-center rounded-full bg-badge-gradient px-3 text-micro font-semibold text-on-brand">
            Upcoming Webinar
          </p>
          <h3 className="text-heading-md text-secondary sm:pr-20">{webinar.title}</h3>
          <p className="text-body text-muted">{webinar.description}</p>
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-caption text-muted">
            <li className="flex items-center gap-1.5">
              <Icon name="calendar" size="sm" className="text-accent" />
              <time dateTime={webinar.startsAt}>{formatDate(webinar.startsAt)}</time>
            </li>
            <li className="flex items-center gap-1.5">
              <Icon name="clock" size="sm" className="text-accent" />
              <time dateTime={webinar.startsAt}>{formatTime(webinar.startsAt)}</time>
            </li>
            <li className="flex items-center gap-1.5">
              <Icon name="user" size="sm" className="text-accent" />
              {webinar.host}
            </li>
          </ul>
        </div>

        <div className="flex items-center justify-between gap-4">
          <ArrowLink href={webinar.registerUrl} target="_blank" rel="noopener noreferrer">
            Register Now
          </ArrowLink>
          {count > 1 && (
            <div className="flex items-center gap-1.5">
              {data.map((item, dot) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Show webinar ${dot + 1} of ${count}`}
                  aria-current={dot === index ? "true" : undefined}
                  onClick={() => go(dot)}
                  className="flex size-4 items-center justify-center rounded-full"
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full transition-colors duration-(--sn-duration-fast)",
                      dot === index ? "bg-brand" : "bg-dot",
                    )}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </article>

      {count > 1 && (
        <div className="absolute top-4 right-4 flex items-center gap-2 sm:top-5 sm:right-5">
          <IconButton
            icon="arrow-left"
            size="carousel"
            className="text-primary"
            aria-label="Previous webinar"
            onClick={() => go(index - 1)}
          />
          <IconButton
            icon="arrow-right"
            size="carousel"
            className="text-primary"
            aria-label="Next webinar"
            onClick={() => go(index + 1)}
          />
        </div>
      )}
    </Card>
  );
}
