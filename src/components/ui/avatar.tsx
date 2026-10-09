import Image from "next/image";
import { type ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";
import { getInitials } from "@/lib/format";

export type AvatarSize = "xs" | "sm" | "md" | "lg";

const sizes: Record<AvatarSize, { box: string; text: string; px: number }> = {
  xs: { box: "size-6", text: "text-micro", px: 24 },
  sm: { box: "size-8", text: "text-caption", px: 32 },
  md: { box: "size-9", text: "text-label", px: 36 },
  lg: { box: "size-11", text: "text-body-lg", px: 44 },
};

export interface AvatarProps extends Omit<ComponentPropsWithRef<"span">, "children"> {
  /** Used for the initials and as the accessible name. */
  name: string;
  /** Optional image; initials show while it's missing. */
  src?: string | null;
  size?: AvatarSize;
}

export function Avatar({ name, src, size = "md", className, ...rest }: AvatarProps) {
  const { box, text, px } = sizes[size];
  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        "bg-active font-semibold text-nav-active select-none",
        box,
        text,
        className,
      )}
      {...rest}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          width={px}
          height={px}
          unoptimized
          className="size-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </span>
  );
}
