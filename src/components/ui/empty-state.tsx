import Image from "next/image";
import { type ReactNode } from "react";

import { type StaticImage } from "@/config/assets";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  /** Illustration from `emptyStates` in `src/config/assets.ts`. */
  image: StaticImage;
  title: string;
  description: string;
  /** Usually a primary button ("Create your first API Key"). */
  action?: ReactNode;
  className?: string;
}

/** Centered "nothing here yet" block: illustration, heading, supporting text and a call to action. */
export function EmptyState({ image, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn("flex w-full max-w-97.5 flex-col items-center gap-8 text-center", className)}
    >
      <Image
        src={image.src}
        alt=""
        width={image.width}
        height={image.height}
        style={{ height: image.height }}
        className="rounded-xl"
      />
      <div className="flex flex-col gap-3">
        <h2 className="text-heading-md leading-[1.2]">{title}</h2>
        <p className="text-body leading-[1.2] text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
