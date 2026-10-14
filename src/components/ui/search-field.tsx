import { type ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";

import { Icon } from "./icon/icon";

type SearchFieldProps = Omit<ComponentPropsWithRef<"input">, "type"> & {
  /** Accessible name; the field has no visible label. */
  "aria-label": string;
};

/** Search box with a leading magnifier (Figma: table toolbar, 37px, r8). Controlled like a normal input. */
export function SearchField({ className, ...rest }: SearchFieldProps) {
  return (
    <div
      role="search"
      className={cn(
        "flex h-9.25 w-full max-w-108.5 items-center gap-2.5 rounded-md border border-table-control bg-table-head px-4",
        "transition-colors duration-(--sn-duration-fast) ease-standard focus-within:border-focus",
        className,
      )}
    >
      <Icon name="search" size={18} className="shrink-0 text-muted" />
      <input
        type="search"
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent text-body text-primary outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
        {...rest}
      />
    </div>
  );
}
