import Image from "next/image";
import Link from "next/link";

import { brand } from "@/config/assets";
import { routes } from "@/config/routes";
import { cn } from "@/lib/cn";

import { Wordmark } from "./wordmark";

interface LogoProps {
  /** Mark only (icon rail). */
  compact?: boolean;
  className?: string;
  onClick?: () => void;
}

/** Brand lockup; links to the dashboard. The mark is multicolour, the wordmark follows text color. */
export function Logo({ compact, className, onClick }: LogoProps) {
  return (
    <Link
      href={routes.dashboard}
      onClick={onClick}
      aria-label="SambaNova, go to Dashboard"
      className={cn("flex h-7.5 items-center gap-2.5 rounded-xs", className)}
    >
      <Image
        src={brand.mark.src}
        alt=""
        width={brand.mark.width}
        height={brand.mark.height}
        className="shrink-0"
      />
      {!compact && (
        <Wordmark aria-hidden="true" role={undefined} className="h-4.25 w-auto text-primary" />
      )}
    </Link>
  );
}
