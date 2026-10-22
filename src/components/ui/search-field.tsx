import { type ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";

import { Icon } from "./icon/icon";

type SearchFieldProps = Omit<ComponentPropsWithRef<"input">, "type"> & {
  /** Accessible name; the field has no visible label. */
  "aria-label": string;
  /** Shows a clear button while there is text and lets Escape clear it (Figma: Members search). */
  onClear?: () => void;
};

/** Search box with a leading magnifier (Figma: table toolbar, 37px, r8). Controlled like a normal input. */
export function SearchField({ className, onClear, onKeyDown, ...rest }: SearchFieldProps) {
  const clearable = Boolean(onClear && rest.value);

  return (
    <div
      role="search"
      className={cn(
        "flex h-9.25 w-full max-w-108.5 items-center gap-2.5 rounded-md border border-table-control bg-table-head",
        onClear ? "pr-1.5 pl-4" : "px-4",
        "transition-colors duration-(--sn-duration-fast) ease-standard focus-within:border-focus",
        className,
      )}
    >
      <Icon name="search" size={18} className="shrink-0 text-muted" />
      <input
        type="search"
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent text-body text-primary outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
        onKeyDown={(event) => {
          if (clearable && event.key === "Escape") {
            event.preventDefault();
            onClear?.();
          }
          onKeyDown?.(event);
        }}
        {...rest}
      />
      {clearable && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={onClear}
          className="flex size-6 shrink-0 items-center justify-center rounded-xs text-muted transition-colors duration-(--sn-duration-fast) ease-standard hover:bg-hover hover:text-primary"
        >
          <Icon name="close" size={14} />
        </button>
      )}
    </div>
  );
}
