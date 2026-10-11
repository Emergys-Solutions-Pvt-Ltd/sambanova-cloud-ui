"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { type ReactNode } from "react";

import { cn } from "@/lib/cn";

import { menuItemClasses } from "./dropdown-menu";
import { Icon } from "./icon/icon";
import { menuSurfaceAboveModal } from "./popover";

export interface SelectOption {
  value: string;
  label: string;
  /** Optional leading visual, e.g. a model logo. */
  leading?: ReactNode;
}

export interface SelectGroup {
  /** Group heading ("Reasoning", "Text"…). Omit for a flat list. */
  label?: string;
  options: SelectOption[];
}

export interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  groups: SelectGroup[];
  /** Accessible name; required because the trigger shows only the current value. */
  "aria-label": string;
  /** Icon shown before the value. */
  icon?: ReactNode;
  placeholder?: string;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
  /** "field" matches form inputs in modals (37px, r8, input stroke); "compact" is the 38px Quickstart select. */
  variant?: "compact" | "field";
  id?: string;
  onBlur?: () => void;
  invalid?: boolean;
}

/** 38px field select (Figma: Quickstart model and endpoint selectors). Radix supplies the behaviour. */
export function Select({
  value,
  onValueChange,
  groups,
  icon,
  placeholder,
  className,
  contentClassName,
  disabled,
  variant = "compact",
  id,
  onBlur,
  invalid,
  "aria-label": ariaLabel,
}: SelectProps) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        id={id}
        aria-label={ariaLabel}
        aria-invalid={invalid ? true : undefined}
        onBlur={onBlur}
        className={cn(
          "inline-flex w-full items-center justify-between gap-3 border bg-input text-body text-primary outline-none",
          variant === "field" ? "h-9.25 rounded-md pr-2.5 pl-4" : "h-9.5 rounded-sm px-2.5",
          invalid ? "border-error-border" : "border-input",
          "transition-colors duration-(--sn-duration-fast) ease-standard hover:bg-hover",
          "disabled:cursor-not-allowed disabled:text-disabled data-[placeholder]:text-muted",
          className,
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {icon}
          <span className="truncate">
            <SelectPrimitive.Value placeholder={placeholder} />
          </span>
        </span>
        <SelectPrimitive.Icon asChild>
          <Icon name="chevron-down" size="sm" className="shrink-0 text-muted" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          collisionPadding={12}
          className={cn(
            menuSurfaceAboveModal,
            "min-w-(--radix-select-trigger-width) overflow-hidden",
            contentClassName,
          )}
        >
          <SelectPrimitive.Viewport className="max-h-72 overflow-y-auto">
            {groups.map((group, index) => (
              <SelectPrimitive.Group key={group.label ?? index}>
                {group.label && (
                  <SelectPrimitive.Label className="px-4 pt-2 pb-1 text-caption tracking-caps text-menu-label uppercase">
                    {group.label}
                  </SelectPrimitive.Label>
                )}
                {group.options.map((option) => (
                  <SelectPrimitive.Item
                    key={option.value}
                    value={option.value}
                    className={cn(
                      menuItemClasses,
                      "justify-between data-[state=checked]:text-primary",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {option.leading}
                      <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                    </span>
                    <SelectPrimitive.ItemIndicator>
                      <Icon name="check" size="sm" />
                    </SelectPrimitive.ItemIndicator>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Group>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
