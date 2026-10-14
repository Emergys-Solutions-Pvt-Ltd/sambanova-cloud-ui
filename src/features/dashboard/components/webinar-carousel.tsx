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
 * Upcoming-webinar promo with previous/next arrows and position dots (Figma: Marketing Card,
 * 728 x 239). No autoplay: moving content is a WCAG concern and Figma shows manual controls only.
 * The dots only show the position; the arrows are the controls.
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
      className="flex flex-col gap-5 sm:min-h-59.75 sm:flex-row sm:pb-4.5"
    >
      {/* The 201.5px picture is 2.5px taller than the 199px column, so it hangs below its slot (-mb) like in Figma. */}
      <div className="relative h-[201.5px] w-[201.286px] shrink-0 self-center overflow-hidden rounded-md border border-switcher-border sm:-mb-[2.5px] sm:self-start">
        <Image
          src="/dashboard/webinar.webp"
          alt=""
          width={201}
          height={202}
          className="size-full object-cover"
        />
        <span aria-hidden="true" className="absolute inset-0 bg-tint-promo" />
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col sm:max-w-115">
        <article
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${count}`}
          aria-live="polite"
          className="flex flex-1 flex-col justify-between gap-6"
        >
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-5">
                <p className="inline-flex h-5.25 w-fit items-center rounded-full bg-badge-gradient px-3 text-micro font-semibold text-on-brand">
                  Upcoming Webinar
                </p>
                <h3 className="text-heading-md leading-6 text-secondary">{webinar.title}</h3>
              </div>
              <p className="max-w-108.75 text-body text-muted">{webinar.description}</p>
            </div>
            <ul className="flex flex-wrap gap-x-3 gap-y-1 text-caption text-muted">
              <li className="flex items-center gap-1.5">
                <Icon name="calendar" size="sm" className="text-accent" />
                <time dateTime={webinar.startsAt} className="inline-block min-w-19.25 text-center">
                  {formatDate(webinar.startsAt)}
                </time>
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

          <div className="flex h-4.75 items-center gap-3.5">
            <ArrowLink
              href={webinar.registerUrl}
              target="_blank"
              rel="noopener noreferrer"
              icon="arrow-right-wide"
              iconStrokeWidth={1.3}
            >
              Register Now
            </ArrowLink>
            {count > 1 && (
              <div
                aria-hidden="true"
                className="flex flex-1 items-end justify-end gap-1.5 self-end"
              >
                {data.map((item, dot) => (
                  <span
                    key={item.id}
                    className={cn(
                      "size-1.5 rounded-full transition-colors duration-(--sn-duration-fast)",
                      dot === index ? "bg-brand" : "bg-dot",
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </article>

        {count > 1 && (
          <div className="absolute top-0 right-0 flex h-5.25 items-center gap-2.5">
            <IconButton
              icon="arrow-left-short"
              size="carousel"
              className="text-primary"
              aria-label="Previous webinar"
              onClick={() => go(index - 1)}
            />
            <IconButton
              icon="arrow-right-short"
              size="carousel"
              className="text-primary"
              aria-label="Next webinar"
              onClick={() => go(index + 1)}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
